const { Clients, Vendors, Languages, Pricelist, Step, Units, MemoqProject, CurrencyRatio } = require('../../../models');
const ObjectId = require('mongodb').ObjectID;
const { getPriceFromPersonRates, getCorrectBasicPrice } = require('../../../сalculations/finance');
const { defaultFinanceObj } = require('../../../enums');
const { multiplyPrices } = require('../../../multipliers');
const { findFittingIndustryId } = require('./helpers');
const { getPriceAfterApplyingDiscounts } = require('../../../projects/helpers');
const { getMemoqProject } = require('./getMemoqProject');
const { setTaskMetrics, getRelativeQuantity } = require('../../../helpers/projectMetrics')
const { calculateCrossRate, rateExchangeVendorOntoProject } = require('../../../helpers/commonFunctions')

const createOtherProjectFinanceData = async ({ project, documents }, fromCron = false) => {
  const clients = await Clients.find().populate('discounts');
  const vendors = await Vendors.find();
  const { USD, GBP } = await CurrencyRatio.findOne();
  const { additionalData, neededCustomer } = await getUpdatedProjectData(project, clients);

  //RETURN
  if (!neededCustomer) return project;
  //RETURN
  if(project.lockedForRecalculation) return project;

  let updatedProject = project.hasOwnProperty('name') ? { ...project, ...additionalData } : { ...project._doc, ...additionalData };
  updatedProject = updateCurrencyProject(updatedProject, clients, { USD, GBP })

  let steps = checkKeyInObject('steps');
  let tasks = checkKeyInObject('tasks');
  let  minimumCharge = project.hasOwnProperty('minimumCharge') ? project.minimumCharge : false;

  const newData = await getProjectTasksAndSteps(documents, updatedProject, neededCustomer, vendors);
  tasks = newData.tasks;
  steps = newData.steps;

  //RETURN
  if (!steps.length) return project;

  if (!steps.every(step => step.vendor)) {
    steps = await checkAndCorrectStepStructure(steps, tasks, documents);
  }

  const finance = tasks.length ? getProjectFinance(tasks, minimumCharge) : defaultFinanceObj;

  //RETURN
  if (fromCron) return { ...updatedProject, tasks, steps, finance };
  //RETURN
  await MemoqProject.updateOne({ _id: project._id }, { ...updatedProject, tasks, steps, finance });
  return await getMemoqProject({ _id: project._id });

  async function checkAndCorrectStepStructure(steps, tasks, documents) {
    let memoqVendorsArr;
    const neededStepIndex = steps.findIndex(({ vendor }) => !vendor);
    const neededDocumentIndex = tasks.findIndex(({ taskId }) => taskId === steps[neededStepIndex].taskId);

    if(documents.length){
      memoqVendorsArr = documents[neededDocumentIndex].UserAssignments.TranslationDocumentUserRoleAssignmentDetails;
      memoqVendorsArr = Array.isArray(memoqVendorsArr) ? memoqVendorsArr : [memoqVendorsArr]

      const indexRegex = new RegExp(/(?<=S)[0-9][0-9]/g);
      let index = indexRegex.exec(steps[neededStepIndex].stepId)[0];
      index = index === '01' ? 0 : 1;
      const { UserInfoHeader: { FullName } } = memoqVendorsArr[index];
      const vendor = vendors.find(vendor => vendor.aliases.includes(FullName));
      steps[neededStepIndex].vendorRate = await getStepUserRate(vendor, project, steps[neededStepIndex].name, tasks[neededDocumentIndex])
      steps[neededStepIndex].vendor = vendor;
      return steps;
    }
  }

  function checkKeyInObject(key){
    return project.hasOwnProperty(key) ? project[key] : []
  }
};


const getProjectTasksAndSteps = async (documents, project, customer, vendors) => {
  const { sourceLanguage, targetLanguages, name } = project;
  const taskName = name && /(.*])\s- /gm.exec(name) ? /(.*])\s- /gm.exec(name)[1] : null;
  const tasks = [];
  const steps = [];
  if(!Array.isArray(documents)) {
    documents = [documents];
  }
  let tasksLength = documents.length + 1;
  for (let i = 0; i < documents.length; i += 1) {
    const { WorkflowStatus, TargetLangCode, TotalWordCount, metrics } = documents[i];
    let idNumber = tasksLength < 10 ? ` T0${i + 1}` : ` T${i + 1}`;
    let taskId = taskName + `${idNumber}`;
    let targetLanguage = targetLanguages.filter(item => item).find(lang => lang.memoq === TargetLangCode);
    targetLanguage = targetLanguage ? targetLanguage : { symbol: '' };
    const sourceLang = sourceLanguage ? sourceLanguage : { symbol: '' };
    const taskStepsWithOutFinance = await getTaskSteps({ taskId, sourceLanguage: sourceLang.symbol, targetLanguage: targetLanguage.symbol, }, project, documents[i], customer, vendors);

    let newMetrics = setTaskMetrics({metrics, matrix: customer.matrix, prop: "client" })
    const { vendor } = taskStepsWithOutFinance.find(({name}) => name === 'Translation')
    if(vendor){
      const { matrix } = vendors.find(({_id}) => _id.toString() === vendor.toString())
      newMetrics = setTaskMetrics({metrics, matrix: matrix, prop: "vendor" })
    }

    const finalSteps = getTaskStepsFinance(taskStepsWithOutFinance, newMetrics, project)

    const task = {
      taskId,
      metrics,
      start: project.creationTime,
      deadline: project.deadline,
      sourceLanguage: sourceLang.symbol,
      targetLanguage: targetLanguage.symbol,
      status: WorkflowStatus,
      progress: 0,
      finance: finalSteps.length ? getTaskFinance(finalSteps, TotalWordCount) : defaultFinanceObj,
    };
    tasks.push(task);
    steps.push(...finalSteps);
  }

  return { tasks, steps };


};

const getTaskSteps = async (task, project, document, customer, vendors) => {
  const { taskId, sourceLanguage, targetLanguage } = task;
  const { TotalWordCount } = document;
  const steps = [];
  let { UserAssignments: { TranslationDocumentUserRoleAssignmentDetails: memoqVendorsArr } } = document;
  memoqVendorsArr = Array.isArray(memoqVendorsArr) ? memoqVendorsArr : [memoqVendorsArr]

  for (let i = 0; i < memoqVendorsArr.length; i += 1) {
    const { DocumentAssignmentRole, UserInfoHeader: { FullName } } = memoqVendorsArr[i];
    const stepName = !!+DocumentAssignmentRole ? 'Revising' : 'Translation';
    const vendor = vendors.find(vendor => vendor.aliases.includes(FullName));
    const clientRate = await getStepUserRate(customer, project, stepName, task);
    console.log(project.projectCurrency)
    const nativeVendorRate = await getStepUserRate(vendor, project, stepName, task)
    let vendorRate = ''
    if(nativeVendorRate){
      vendorRate = {
        ...nativeVendorRate,
        value: rateExchangeVendorOntoProject(project.projectCurrency, 'EUR', +nativeVendorRate.value, project.crossRate)
      }
    }
    steps.push({
      taskId,
      stepId: `${taskId} S0${i + 1}`,
      sourceLanguage,
      targetLanguage,
      name: stepName,
      totalWords: TotalWordCount,
      quantity: TotalWordCount,
      clientRate,
      vendorRate,
      nativeVendorRate,
      vendor: vendor ? ObjectId(vendor._id) : null,
    });
  }
  return steps;
};

const getTaskStepsFinance = (steps, metrics, project) => {
  for (let i = 0; i < steps.length ; i++) {
    const  {clientRate, vendorRate, totalWords, name}  = steps[i]
    steps[i].finance = name === 'Translation' ?
        getStepFinance({
          clientRate,
          vendorRate,
          WeightedWordsClient: getRelativeQuantity(metrics, 'client').toFixed(2),
          WeightedWordsVendor: getRelativeQuantity(metrics, 'vendor').toFixed(2),
          discounts: project.discounts
        }) :
        getStepFinance({
          clientRate,
          vendorRate,
          WeightedWordsClient: totalWords,
          WeightedWordsVendor: totalWords,
          discounts: project.discounts
        })
  }
  return steps
}

const getUpdatedProjectData = async (project, allClients) => {
  const { client: memoqClient } = project;

  const neededCustomer = allClients.find(client => client.aliases.includes(memoqClient));
  const industry = await findFittingIndustryId(project.domain);
  let additionalData = {};
  if(neededCustomer) {
    const discounts = project.hasOwnProperty('discounts') ? project.discounts : [...neededCustomer.discounts];
    additionalData = {
      customer: ObjectId(neededCustomer._id),
      discounts,
      projectManager: ObjectId(neededCustomer.projectManager._id),
      accountManager: ObjectId(neededCustomer.accountManager._id),
      industry: ObjectId(industry._id),
      paymentProfile: neededCustomer.billingInfo.paymentType,
    };
  }
  return { additionalData, neededCustomer };
};

const getStepUserRate = async (user, project, stepName, task) => {
  const { industry } = project;
  let { sourceLanguage, targetLanguage } = task;
  if(user) {
    const { rates: { pricelistTable }, defaultPricelist, currency } = user;
    const pricelist = defaultPricelist ?
      await Pricelist.findOne({ _id: user.defaultPricelist })
      : await Pricelist.findOne({ isVendorDefault: true });
    const source = await Languages.findOne({ symbol: sourceLanguage });
    const target = await Languages.findOne({ symbol: targetLanguage });
    const step = await Step.findOne({ title: stepName });
    const { _id: unitId } = await Units.findOne({ type: 'CAT Wordcount' });
    const dataForComparison = {
      sourceLanguage: source ? source._id : null,
      targetLanguage: target ? target._id : null,
      step: step ? step._id : null,
      unit: unitId,
      size: 1,
      industry: industry,
    };
    if(source && target && step) {
      let userPrice = getPriceFromPersonRates(pricelistTable, dataForComparison);
      if(!userPrice) {
        return {
          value: getPriceFromPricelist(pricelist, dataForComparison, currency),
          active: true,
          fromUser: false
        }
      }
      return {
        value: userPrice,
        active: true,
        fromUser: true
      };
    }
  }
  return '';
};

const getStepFinance = ({clientRate, vendorRate, WeightedWordsClient, WeightedWordsVendor, discounts}) => {
  const priceReceivables = clientRate ?
      +(clientRate.value * WeightedWordsClient).toFixed(2) :
      0;

  const pricePayables = vendorRate ?
      +(vendorRate.value * WeightedWordsVendor).toFixed(2) :
      0;

  const profit = pricePayables ?
      (priceReceivables - pricePayables).toFixed(2) :
      0;

  const ROI = pricePayables && pricePayables !== 0 ?
      ((priceReceivables - pricePayables) / pricePayables).toFixed(2) :
      0;

  return {
    Wordcount: {
      receivables: WeightedWordsClient,
      payables: WeightedWordsVendor,
    },
    Price: {
      receivables: discounts && discounts.length ? getPriceAfterApplyingDiscounts(discounts, priceReceivables) : +priceReceivables,
      payables: +pricePayables,
    },
    profit,
    ROI,
    priceReceivables
  };
};

const getTaskFinance = (taskSteps, TotalWordCount) => {
	let priceReceivables = 0;
	let pricePayables = 0;
	for (let { finance } of taskSteps) {
		priceReceivables += +finance.Price.receivables;
		pricePayables += +finance.Price.payables;
	}
	const profit = pricePayables ? (priceReceivables - pricePayables).toFixed(2) : 0;
	const ROI = pricePayables ? ((priceReceivables - pricePayables) / pricePayables).toFixed(2) : 0;
	return {
		Wordcount: {
			receivables: +TotalWordCount,
			payables: +TotalWordCount,
		},
		Price: {
      receivables: +priceReceivables.toFixed(2),
      payables: +pricePayables.toFixed(2),
    },
		profit,
		ROI
	};
};

const getProjectFinance = (tasks, minimumCharge) => {
  let priceReceivables = 0;
  let pricePayables = 0;
  let TotalWordCount = 0;
  for (let { finance } of tasks) {
    priceReceivables += +finance.Price.receivables;
    pricePayables += +finance.Price.payables;
    TotalWordCount += finance.Wordcount.receivables;
  }
  const profit = pricePayables ? (priceReceivables - pricePayables).toFixed(2) : 0;
  let roi = pricePayables ? ((priceReceivables - pricePayables) / pricePayables).toFixed(2) : 0;
  if (minimumCharge) {
    const { value, toIgnore } = minimumCharge;
    if (!toIgnore && value > priceReceivables) {
      roi = pricePayables ? ((value - pricePayables) / pricePayables).toFixed(2) : 0
    }
  }
  return {
    Wordcount: {
      receivables: +TotalWordCount,
      payables: +TotalWordCount,
    },
    Price: {
      receivables: priceReceivables.toFixed(2),
      payables: pricePayables.toFixed(2),
    },
    profit,
    roi
  };
};

const getPriceFromPricelist = (pricelist, data, currency) => {
	const { basicPricesTable, stepMultipliersTable, industryMultipliersTable } = pricelist;
	const { sourceLanguage, targetLanguage, step, unit, size, industry } = data;
	let row = basicPricesTable.find(langPair => (
			`${ langPair.sourceLanguage } ${ langPair.targetLanguage }` === `${ sourceLanguage } ${ targetLanguage }`
	));
	const stepRow = stepMultipliersTable.find(item => (
			`${ item.step } ${ item.unit } ${ item.size }` === `${ step } ${ unit } ${ size }`
	));
	const industryRow = industryMultipliersTable.find(item => (
			item.industry.toString() === industry.toString()
	));
	if(row && stepRow && industryRow) {
		const { multiplier: stepMultiplier } = stepRow;
		const { multiplier: industryMultiplier } = industryRow;
		const basicPrice = getCorrectBasicPrice(row, currency);
		return multiplyPrices(basicPrice, stepMultiplier, size, industryMultiplier);
	}
	return 0;
};

const updateCurrencyProject = (project, clients, { USD, GBP }) => {
  const { customer } = project
  const { currency } = clients.find(({_id}) => _id === customer)
  project.crossRate = calculateCrossRate(USD, GBP);
  project.projectCurrency = currency
  return project
}

module.exports = {
	createOtherProjectFinanceData
};
