const { Clients, Vendors, Languages, Industries, Pricelist, CurrencyRatio, Step, Units, MemoqProject } = require('../../../models');
const ObjectId = require('mongodb').ObjectID;
const { getPriceFromPersonRates, getPriceFromPricelist } = require('../../../сalculations/finance');
const { defaultFinanceObj } = require('../../../enums');

const createOtherProjectFinanceData = async ({ project, documents }, fromCron = false) => {
  const clients = await Clients.find();
  const vendors = await Vendors.find();
  const { additionalData, neededCustomer } = getUpdatedProjectData(project, clients);
  if (!neededCustomer) return project;
  const updatedProject = { ...project._doc, ...additionalData };
  const { tasks, steps } = await getProjectTasks(documents, updatedProject, neededCustomer, vendors);
  if (!tasks.length && !steps.length) return project;
  const finance = tasks.length ? getProjectFinance(tasks) : defaultFinanceObj;
  if (fromCron) return { ...updatedProject, tasks, steps, finance };
  return await MemoqProject.updateOne(
    { _id: project._id }, { ...additionalData, tasks, steps, finance })
    .populate('customer')
    .populate('steps.vendor')
    .populate('projectManager')
    .populate('accountManager');
};

const getProjectTasks = async (documents, project, customer, vendors) => {
  const { sourceLanguage, targetLanguages, name, industry } = project;
  const taskName = name ? /(.*])\s- /gm.exec(name)[1] : null;
  const tasks = [];
  const steps = [];
  if (industry !== 'Other') {
    if (!Array.isArray(documents)) {
      documents = [documents];
    }
    let tasksLength = documents.length + 1;
    for (let i = 0; i < documents.length; i += 1) {
      const { WorkflowStatus, TargetLangCode, TotalWordCount } = documents[i];
      let idNumber = tasksLength < 10 ? `T0${tasksLength}` : `T${tasksLength}`;
      let taskId = taskName + `${idNumber}`;
      const targetLanguage = targetLanguages.find(lang => lang.memoq === TargetLangCode);
      const taskSteps = await getTaskSteps(
        {
          taskId,
          sourceLanguage: sourceLanguage.symbol,
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
  }
  return { tasks, steps };
};

const getTaskSteps = async (task, project, document, customer, vendors) => {
  const { taskId, sourceLanguage, targetLanguage } = task;
  const { TotalWordCount, WeightedWords } = document;
  const steps = [];
  const { UserAssignments: { TranslationDocumentUserRoleAssignmentDetails: memoqVendorsArr } } = document;
  for (let i = 0; i < memoqVendorsArr.length; i += 1) {
    const { DocumentAssignmentRole, UserInfoHeader: { FullName } } = memoqVendorsArr[i];
    const stepName = +DocumentAssignmentRole ? 'Revising' : 'Translation';
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
      finance: getStepFinance(clientRate, vendorRate, TotalWordCount, WeightedWords),
    });
  }
  return steps;
};

const getUpdatedProjectData = (project, allClients) => {
  const { client: memoqClient } = project;
  const neededCustomer = allClients.find(client => client.aliases.includes(memoqClient));
  const industry = getIndustryId(project.domain);
  let additionalData = {};
  if (neededCustomer) {
    additionalData = {
      customer: ObjectId(neededCustomer._id),
      status: 'Closed',
      projectManager: ObjectId(neededCustomer.projectManager._id),
      accountManager: ObjectId(neededCustomer.accountManager._id),
      industry: industry.name === 'Other' ? project.domain : ObjectId(industry._id),
      paymentProfile: neededCustomer.billingInfo.paymentType,
    };
  }
  return { additionalData, neededCustomer };
};

const getStepUserRate = async (user, project, stepName, task) => {
  const { domain } = project;
  const currencyRatio = await CurrencyRatio.findOne();
  const industry = await getIndustryId(domain);
  let { sourceLanguage, targetLanguage } = task;
  if (user) {
    const { rates: { pricelistTable }, currency } = user;
    const pricelist = user.hasOwnProperty('defaultPricelist') ?
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
      industry: industry._id,
    };
    if (source && target && step) {
      let userPrice = getPriceFromPersonRates(
        pricelistTable,
        dataForComparison) || getPriceFromPricelist(pricelist, dataForComparison, currency, currencyRatio);
      return {
        value: userPrice,
        active: true
      };
    }
  }
  return '';
};

const getIndustryId = async (industryName) => {
  if (industryName === 'iGaming' || industryName === 'Finance') {
    return await Industries.findOne({ name: { '$regex': new RegExp(`${industryName}`, 'i') } });
  } else {
    switch (industryName) {
      case 'eLearning':
        return await Industries.findOne({ name: 'E-Learning' });
      case 'Tourism':
        return await Industries.findOne({ name: 'Museums & Tourist Attractions' });
      case 'Medicine':
        return await Industries.findOne({ name: 'Medical Devices' });
      case 'Law':
        return await Industries.findOne({ name: 'Legal' });
      case 'Sport-Betting':
        return await Industries.findOne({ name: 'Sports Betting' });
      default:
        return await Industries.findOne({ name: 'Other' });
    }
  }
};

const getStepFinance = (clientRate, vendorRate, TotalWordCount, WeightedWords) => {
  const priceReceivables = clientRate ? +clientRate.value * +WeightedWords : 0;
  const pricePayables = vendorRate ? +vendorRate.value * +WeightedWords : 0;
  const profit = pricePayables ? priceReceivables - pricePayables : 0;
  const ROI = pricePayables ? ((priceReceivables - pricePayables) / pricePayables).toFixed(2) : 0;
  return {
    Wordcount: {
      receivables: +WeightedWords,
      payables: +WeightedWords,
    },
    Price: {
      receivables: priceReceivables,
      payables: pricePayables,
    },
    profit,
    ROI
  };
};

const getTaskFinance = (taskSteps, TotalWordCount) => {
  let priceReceivables = 0;
  let pricePayables = 0;
  for (let { finance } of taskSteps) {
    priceReceivables += finance.Price.receivables;
    pricePayables += finance.Price.payables;
  }
  const profit = pricePayables ? (priceReceivables - pricePayables).toFixed(2) : 0;
  const ROI = pricePayables ? ((priceReceivables - pricePayables) / pricePayables).toFixed(2) : 0;
  return {
    Wordcount: {
      receivables: +TotalWordCount,
      payables: +TotalWordCount,
    },
    Price: {
      receivables: priceReceivables,
      payables: pricePayables,
    },
    profit,
    ROI
  };
};

const getProjectFinance = (tasks) => {
  let priceReceivables = 0;
  let pricePayables = 0;
  let TotalWordCount = 0;
  for (let { finance } of tasks) {
    priceReceivables += finance.Price.receivables;
    pricePayables += finance.Price.payables;
    TotalWordCount += finance.Wordcount.receivables;
  }
  const profit = pricePayables ? priceReceivables - pricePayables : 0;
  const ROI = pricePayables ? ((priceReceivables - pricePayables) / pricePayables).toFixed(2) : 0;
  return {
    Wordcount: {
      receivables: +TotalWordCount,
      payables: +TotalWordCount,
    },
    Price: {
      receivables: priceReceivables,
      payables: pricePayables,
    },
    profit,
    ROI
  };
};

module.exports = {
  createOtherProjectFinanceData
};
