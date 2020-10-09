const { Clients, Vendors, User, Languages, Industries, Pricelist, CurrencyRatio, Step, Units } = require('../../../models');
const ObjectId = require('mongodb').ObjectID;
const { getPriceFromPersonRates, getPriceFromPricelist } = require('../../../сalculations/finance');
const { checkDocumentHasCorrectStructure } = require('./helpers');
const { defaultFinanceObj } = require('../../../enums');

const createOtherProjectFinanceData = async ({ project, documents }) => {
  const clients = await Clients.find();
  const vendors = await Vendors.find();
  const users = await User.find();
  if (!project.hasOwnProperty('users')) return project;
  const { updatedProject, neededCustomer } = getUpdatedProjectData(project, documents, clients, users);
  if (!neededCustomer) return project;
  const { tasks, steps } = await getProjectTasks(documents, updatedProject, neededCustomer, vendors);
  const finance = tasks.length ? getProjectFinance(tasks) : defaultFinanceObj;
  return { ...updatedProject, tasks, steps, finance };
};

const getProjectTasks = async (documents, project, customer, vendors) => {
  const { sourceLanguage, targetLanguages, name, industry } = project;
  const taskName = name ? /(.*])\s- /gm.exec(name)[1] : null;
  const tasks = [];
  const steps = [];
  if (industry !== 'Other') {
    let tasksLength = documents.length + 1;
    for (let i = 0; i < documents.length; i += 1) {
      const { WorkflowStatus } = documents[i];
      let idNumber = tasksLength < 10 ? `T0${tasksLength}` : `T${tasksLength}`;
      let taskId = taskName + `${idNumber}`;
      const taskSteps = await getTaskSteps(
        {
          taskId,
          sourceLanguage: sourceLanguage.memoq,
          targetLanguages: targetLanguages[i] ? targetLanguages[i].memoq : null,
        },
        project, documents[i], customer, vendors
      );
      const task = {
        taskId,
        start: project.creationTime,
        deadline: project.deadline,
        sourceLanguage: sourceLanguage.memoq,
        targetLanguage: targetLanguages[i] ? targetLanguages[i].memoq : null,
        status: WorkflowStatus,
        progress: 100,
        finance: taskSteps.length ? getTaskFinance(taskSteps, WorkflowStatus) : defaultFinanceObj,
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
  const documentHasCorrectStructure = checkDocumentHasCorrectStructure(document);
  if (documentHasCorrectStructure) {
    const { UserAssignments: { TranslationDocumentUserRoleAssignmentDetails: memoqVendorsArr } } = document;
    for (let i = 0; i < memoqVendorsArr.length; i += 1) {
      const { DocumentAssignmentRole, UserInfoHeader: { FullName } } = memoqVendorsArr[i];
      const stepName = +DocumentAssignmentRole ? 'Revising' : 'Translation';
      const vendor = vendors.find(vendor => vendor.aliases.includes(FullName));
      const clientRate = customer ? await getStepUserRate(customer, project, stepName, task) : '';
      const vendorRate = vendor ? await getStepUserRate(vendor, project, stepName, task) : '';
      steps.push({
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
  } else {
    return [];
  }
  return steps;
};

const getUpdatedProjectData = (project, documents, allClients, ourUsers) => {
  const { client: memoqClient, users } = project;
  const neededCustomer = allClients.find(client => client.aliases.includes(memoqClient));
  const industry = getIndustryId(project.domain);
  project.customer = neededCustomer ? ObjectId(neededCustomer._id) : null;
  project.status = 'Closed';
  project.projectManager = getProjectManager(users, ourUsers);
  project.accountManager = neededCustomer ? ObjectId(neededCustomer.accountManager._id) : null;
  project.industry = industry.name === 'Other' ? project.domain : ObjectId(industry._id);
  return { updatedProject: project, neededCustomer };
};

const getProjectManager = (memoqUsers, ourUsers) => {
  const memoqPM = memoqUsers.find(({ ProjectRoles }) => ProjectRoles.isPM);
  if (memoqPM) {
    const { User: { EmailAddress } } = memoqPM;
    const ourUser = ourUsers.find(user => user.email === EmailAddress);
    if (ourUser) return ourUser;
  }
  return null;
};

const getStepUserRate = async (user, project, stepName, task) => {
  const { domain } = project;
  const currencyRatio = await CurrencyRatio.findOne();
  const industry = await getIndustryId(domain);
  let { sourceLanguage, targetLanguage } = task;
  const { pricelistTable, currency } = user.rates;
  const pricelist = user.hasOwnProperty('defaultPricelist') ?
    await Pricelist.findOne({ _id: user.defaultPricelist })
    : await Pricelist.findOne({ isVendorDefault: true });
  const source = await Languages.findOne({ memoq: sourceLanguage });
  const target = await Languages.findOne({ memoq: targetLanguage });
  const step = await Step.findOne({ title: stepName });
  const unit = await Units.findOne({ type: 'CAT Wordcount' });
  const dataForComparison = {
    sourceLanguage: source ? source._id : null,
    targetLanguage: target ? target._id : null,
    step,
    unit,
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
  const priceReceivables = clientRate.value * +WeightedWords;
  const pricePayables = vendorRate.value * +WeightedWords;
  const profit = priceReceivables - pricePayables;
  const ROI = ((priceReceivables - pricePayables) / pricePayables).toFixed(2);
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

const getTaskFinance = (taskSteps, TotalWordCount) => {
  let priceReceivables = 0;
  let pricePayables = 0;
  for (let { finance } of taskSteps) {
    priceReceivables += finance.Price.receivables;
    pricePayables += finance.Price.payables;
  }
  const profit = priceReceivables - pricePayables;
  const ROI = ((priceReceivables - pricePayables) / pricePayables).toFixed(2);
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
  const profit = priceReceivables - pricePayables;
  const ROI = ((priceReceivables - pricePayables) / pricePayables).toFixed(2);
  const margin = (pricePayables / (priceReceivables - pricePayables)).toFixed(2);
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
    margin,
    ROI
  };
};

module.exports = {
  createOtherProjectFinanceData
};
