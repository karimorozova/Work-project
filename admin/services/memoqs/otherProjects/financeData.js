const { Clients, Vendors, Languages, Pricelist, Step, Units, MemoqProject } = require('../../../models');
const ObjectId = require('mongodb').ObjectID;
const { getPriceFromPersonRates, getCorrectBasicPrice } = require('../../../сalculations/finance');
const { defaultFinanceObj } = require('../../../enums');
const { multiplyPrices } = require('../../../multipliers');
const { findFittingIndustryId } = require('./helpers');
const { getPriceAfterApplyingDiscounts } = require('../../../projects/helpers');
const { getMemoqProject } = require('./getMemoqProject');

/**
 *
 * @param {Object} project
 * @param {Array} documents
 * @param {Boolean} fromCron
 * @returns {Object} - returns an updated memoq project
 */
const createOtherProjectFinanceData = async ({ project, documents }, fromCron = false) => {
  const clients = await Clients.find().populate('discounts');
  const vendors = await Vendors.find();
  const { additionalData, neededCustomer } = await getUpdatedProjectData(project, clients);
  if (!neededCustomer) return project;
  const updatedProject = project.hasOwnProperty('name') ? { ...project, ...additionalData } :
    { ...project._doc, ...additionalData };
  let { tasks, steps, minimumCharge } = project;
  const emptyTasksOrSteps =  tasks && !tasks.length || steps && !steps.length;
  if (!tasks || !steps || emptyTasksOrSteps) {
    const newData = await getProjectTasks(documents, updatedProject, neededCustomer, vendors);
    tasks = newData.tasks;
    steps = newData.steps;
    if (!steps.length) return project;
  }
  if (!steps.every(step => step.vendor)) {
    steps = await checkAndCorrectStepStructure(steps, tasks, documents);
  }
  const finance = tasks.length ? getProjectFinance(tasks, minimumCharge) : defaultFinanceObj;
  if (fromCron) return { ...updatedProject, tasks, steps, finance };
  await MemoqProject.updateOne({ _id: project._id },
    { ...additionalData, tasks, steps, finance });
  return await getMemoqProject({ _id: project._id });

  async function checkAndCorrectStepStructure(steps, tasks, documents) {
    let memoqVendorsArr;
    const neededStepIndex = steps.findIndex(({ vendor }) => !vendor);
    const neededDocumentIndex = tasks.findIndex(({ taskId }) => taskId === steps[neededStepIndex].taskId);

    if(documents.length){
      memoqVendorsArr = documents[neededDocumentIndex].UserAssignments.TranslationDocumentUserRoleAssignmentDetails
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
};

/**
 *
 * @param {Array} documents
 * @param {Object} project
 * @param {Object} customer
 * @param {Array} vendors
 * @returns {{steps: {Array}, tasks: {Array}}} - returns an array of new tasks and steps
 */
const getProjectTasks = async (documents, project, customer, vendors) => {
  const { sourceLanguage, targetLanguages, name } = project;
  const taskName = name && /(.*])\s- /gm.exec(name) ? /(.*])\s- /gm.exec(name)[1] : null;
  const tasks = [];
  const steps = [];
  if(!Array.isArray(documents)) {
    documents = [documents];
  }
  let tasksLength = documents.length + 1;
  for (let i = 0; i < documents.length; i += 1) {
    const { WorkflowStatus, TargetLangCode, TotalWordCount } = documents[i];
    let idNumber = tasksLength < 10 ? `T0${i + 1}` : `T${i + 1}`;
    let taskId = taskName + `${idNumber}`;
    let targetLanguage = targetLanguages.filter(item => item).find(lang => lang.memoq === TargetLangCode);
    targetLanguage = targetLanguage ? targetLanguage : { symbol: '' };
    const sourceLang = sourceLanguage ? sourceLanguage : { symbol: '' };
    const taskSteps = await getTaskSteps(
      {
        taskId,
        sourceLanguage: sourceLang.symbol,
        targetLanguage: targetLanguage.symbol,
      },
      project, documents[i], customer, vendors
    );
    const task = {
      taskId,
      start: project.creationTime,
      deadline: project.deadline,
      sourceLanguage: sourceLanguage.symbol,
      targetLanguage: targetLanguage.symbol,
      status: WorkflowStatus,
      progress: 100,
      finance: taskSteps.length ? getTaskFinance(taskSteps, TotalWordCount) : defaultFinanceObj,
    };
    tasks.push(task);
    steps.push(...taskSteps);
  }

  return { tasks, steps };
};

/**
 *
 * @param {Object} task
 * @param {Object} project
 * @param {Object} document
 * @param {Object} customer
 * @param {Array} vendors
 * @returns {Array} - returns new steps for project
 */
const getTaskSteps = async (task, project, document, customer, vendors) => {
  const { taskId, sourceLanguage, targetLanguage } = task;
  const { TotalWordCount, WeightedWords } = document;
  const steps = [];
  const { UserAssignments: { TranslationDocumentUserRoleAssignmentDetails: memoqVendorsArr } } = document;
  for (let i = 0; i < memoqVendorsArr.length; i += 1) {
    const { DocumentAssignmentRole, UserInfoHeader: { FullName } } = memoqVendorsArr[i];
    const stepName = !!+DocumentAssignmentRole ? 'Revising' : 'Translation';
    const vendor = vendors.find(vendor => vendor.aliases.includes(FullName));
    const clientRate = await getStepUserRate(customer, project, stepName, task);
    const vendorRate = await getStepUserRate(vendor, project, stepName, task);
    steps.push({
      taskId,
      stepId: `${taskId} S0${i + 1}`,
      sourceLanguage,
      targetLanguage,
      name: stepName,
      totalWords: TotalWordCount,
      quantity: WeightedWords,
      clientRate,
      vendorRate,
      vendor: vendor ? ObjectId(vendor._id) : null,
      finance: getStepFinance(clientRate, vendorRate, TotalWordCount, WeightedWords, project.discounts),
    });
  }
  return steps;
};

/**
 *
 * @param {Object} project
 * @param {Array} allClients
 * @returns {{neededCustomer: {Object}, additionalData: {Object}}}
 */
const getUpdatedProjectData = async (project, allClients) => {
  const { client: memoqClient } = project;
  const neededCustomer = allClients.find(client => client.aliases.includes(memoqClient));
  const industry = await findFittingIndustryId(project.domain);
  let additionalData = {};
  if(neededCustomer) {
    additionalData.discounts = project.hasOwnProperty('discounts') ? project.discounts : [...neededCustomer.discounts];
    additionalData = {
      customer: ObjectId(neededCustomer._id),
      status: project.status,
      projectManager: ObjectId(neededCustomer.projectManager._id),
      accountManager: ObjectId(neededCustomer.accountManager._id),
      industry: ObjectId(industry._id),
      paymentProfile: neededCustomer.billingInfo.paymentType,
    };
  }
  return { additionalData, neededCustomer };
};

/**
 *
 * @param {Object} user
 * @param {Object} project
 * @param {String} stepName
 * @param {Object} task
 * @returns {'' | {Object}} - returns empty string if user doesn't exist or object with data
 */
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

/**
 *
 * @param {Object} clientRate
 * @param {Object} vendorRate
 * @param {Number} TotalWordCount
 * @param {Number} WeightedWords
 * @param {Array} discounts
 * @returns {{}}
 */
const getStepFinance = (clientRate, vendorRate, TotalWordCount, WeightedWords, discounts) => {
  const priceReceivables = clientRate ? +(clientRate.value * WeightedWords).toFixed(2) : 0;
  const pricePayables = vendorRate ? +(vendorRate.value * WeightedWords).toFixed(2) : 0;
  const profit = pricePayables ? (priceReceivables - pricePayables).toFixed(2) : 0;
  const ROI = pricePayables && pricePayables !== 0 ? ((priceReceivables - pricePayables) / pricePayables).toFixed(2) : 0;
  return {
    Wordcount: {
      receivables: +WeightedWords,
      payables: +WeightedWords,
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

module.exports = {
	createOtherProjectFinanceData
};
