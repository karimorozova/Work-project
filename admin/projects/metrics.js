const { getProject, updateProject } = require('./getProjects');
const { CurrencyRatio, Clients, Pricelist, Step, Units, Languages } = require('../models');
const { receivablesCalc, setTaskMetrics } = require('../сalculations/wordcount');
const { getProjectAnalysis } = require('../services/memoqs/projects');
const { multiplyPrices } = require('../multipliers');
const ObjectId = require('mongodb').ObjectID;


async function updateProjectMetrics({ projectId }) {
  try {
    const project = await getProject({ "_id": projectId });
    let { steps, tasks, customer, industry } = project;
    let isMetricsExist = true;
    for (let task of tasks) {
      const stepUnits = JSON.parse(task.stepsAndUnits);
      const isIncludesWordCount = stepUnits.find(item => item.unit === 'CAT Wordcount');
      if (!!isIncludesWordCount && task.status === "Created") {
        const analysis = await getProjectAnalysis(task.memoqProjectId);
        if (analysis && analysis.AnalysisResultForLang) {
          const taskMetrics = getTaskMetrics({ task, matrix: project.customer.matrix, analysis });
          task.metrics = !task.finance.Price.receivables ? { ...taskMetrics } : task.metrics;
          task.finance.Wordcount = calculateWords(task);
          steps = await getTaskSteps(steps, task);
        } else {
          isMetricsExist = false;
        }
      }
    }
    let isWordFirst;
    const lastTask = tasks[tasks.length - 1];
    const stepUnits = JSON.parse(lastTask.stepsAndUnits);
    isWordFirst = stepUnits[0].unit === 'CAT Wordcount' && stepUnits[1].unit !== 'CAT Wordcount';
    let lastSteps = [];
    if (isWordFirst)
      for (let i = 0; i < 2; i++) lastSteps.push(steps.pop())
    steps.push(...lastSteps);
    steps = await setProjectFinanceData({ steps, customer, industry, tasks });
    return await updateProject({ "_id": projectId }, { tasks, steps, isMetricsExist });
  } catch (err) {
    console.log(err);
    console.log("Error in updateProjectMetrics");
  }
}

function getTaskMetrics({ task, matrix, analysis }) {
  let targetMetrics = analysis.AnalysisResultForLang;
  if (Array.isArray(analysis.AnalysisResultForLang)) {
    targetMetrics = analysis.AnalysisResultForLang.find(item => item.TargetLangCode === task.memoqTarget);
  }
  const metrics = Object.keys(targetMetrics.Summary).reduce((acc, cur) => {
    return cur !== 'Fragments' ? { ...acc, [cur]: +targetMetrics.Summary[cur].SourceWordCount } : acc;
  }, {});
  const memoqFilledMetrics = getFilledMemoqMetrics(metrics);
  let taskMetrics = setTaskMetrics({ metrics: memoqFilledMetrics, matrix, prop: "client" });
  return { ...taskMetrics, totalWords: metrics.All };
}

function getFilledMemoqMetrics(metrics) {
  return {
    xTranslated: { text: "X translated", value: +metrics.XTranslated },
    repeat: { text: "Repetition", value: +metrics.Repetition },
    contextMatch: { text: "Context match", value: +metrics.Hit101 },
    repeat100: { text: "100%", value: +metrics.Hit100 },
    repeat50: { text: "50-74%", value: +metrics.Hit50_74 },
    repeat75: { text: "75-84%", value: +metrics.Hit75_84 },
    repeat85: { text: "85-94%", value: +metrics.Hit85_94 },
    repeat95: { text: "95-99%", value: +metrics.Hit95_99 },
    noMatch: { text: "No match", value: +metrics.NoMatch }
  };
}

async function getProjectWithUpdatedFinance(project) {
  let projectToUpdate = { ...project._doc, id: project.id };
  let { tasks, steps } = projectToUpdate;
  try {
    for (let step of steps) {
      const parsedStep = JSON.parse(JSON.stringify(step));
      if (!step.finance.Price.receivables && parsedStep.serviceStep.unit === 'CAT Wordcount') {
        let taskIndex = tasks.findIndex(item => item.taskId === step.taskId);
        const receivables = step.finance.Price.receivables ? {
            rate: step.clientRate, cost: +step.finance.Price.receivables
          }
          : await receivablesCalc({ task: tasks[taskIndex], project: projectToUpdate, step });
        step.clientRate = receivables.rate;
        step.finance.Price.receivables = receivables.cost;
        tasks[taskIndex].finance.Price.receivables = +(tasks[taskIndex].finance.Price.receivables + step.finance.Price.receivables).toFixed(2);
      }
    }
    // steps = steps.reverse()
    return { ...projectToUpdate, tasks, steps };
  } catch (err) {
    console.log(err);
    console.log("Error in getProjectWithUpdatedFinance");
  }
}

async function getTaskSteps(steps, task) {
  const serviceSteps = task.service.steps.reduce((acc, cur) => {
    return { ...acc, [cur.stage]: cur.step };
  }, {});
  let updatedSteps = JSON.parse(JSON.stringify(steps));
  const stepsAndUnits = JSON.parse(task.stepsAndUnits);
  let counter = 1;
  for (let i = 0; i < task.stepsDates.length; i++) {
    const existedStep = updatedSteps.find(item => item.taskId === task.taskId && item.name === serviceSteps[`stage${i + 1}`].title);
    if (!existedStep) {
      let stepsIdCounter = counter < 10 ? `S0${counter}` : `S${counter}`;
      const { _id: stepId } = await Step.findOne({ title: stepsAndUnits[i].step });
      const { _id: unitId, type } = await Units.findOne({ type: stepsAndUnits[i].unit });
      const serviceStep = {
        step: ObjectId(stepId),
        unit: ObjectId(unitId),
        size: stepsAndUnits[i].size || 1,
        memoqAssignmentRole: i
      }
      // const serviceStep = { ...serviceSteps[`stage${i + 1}`], memoqAssignmentRole: i };
      // const { calculationUnit, ...restStepData } = serviceStep;
      const step = {
        stepId: `${task.taskId} ${stepsIdCounter}`,
        taskId: task.taskId,
        serviceStep,
        name: stepsAndUnits[i].step,
        sourceLanguage: task.sourceLanguage,
        targetLanguage: task.targetLanguage,
        memoqProjectId: task.memoqProjectId,
        memoqSource: task.memoqSource,
        memoqTarget: task.memoqTarget,
        memoqDocIds: task.memoqDocs.map(item => item.DocumentGuid),
        vendor: null,
        start: task.stepsDates[i].start || task.start,
        deadline: task.stepsDates[i].deadline,
        progress: setStepsProgress(serviceStep.symbol, task.memoqDocs),
        status: "Created",
        clientRate: "",
        finance: {
          'Wordcount': getStepWordcount(task.metrics, `stage${i + 1}`),
          'Price': { receivables: 0, payables: 0 }
        },
        vendorRate: "",
        totalWords: task.metrics.totalWords,
        check: false,
        vendorsClickedOffer: [],
        isVendorRead: false
      }
      if (type !== 'CAT Wordcount' && type !== 'Packages') {
        delete step.totalWords;
        Object.assign(step, { hours: stepsAndUnits[i].hours, size: stepsAndUnits[i].size });
      } else if (type === 'Packages') {
        delete step.totalWords;
        Object.assign(step, { quantity: stepsAndUnits[i].quantity, size: stepsAndUnits[i].size });
      } else {
        if (!step.hasOwnProperty('totalWords')) {
          Object.assign(step, { totalWords: task.metrics.totalWords });
        }
      }
      updatedSteps.push(step);
      counter++;
    } else {
      for (let step of updatedSteps) {
        if (step.taskId === task.taskId) {
          step.progress = setStepsProgress(serviceSteps[`stage${i + 1}`].symbol, task.memoqDocs);
        }
      }
    }
  }
  return updatedSteps;
}

// function getStepDeadline (task, i) {
//   if (task.stepsDates.length > 1) {
//     return task.stepsDates[i].deadline || task.deadline;
//   }
//   return task.deadline;
// }

function getStepWordcount(taskMetrics, stage) {
  const receivables = stage === 'stage1' ? calculateTranslationWords(taskMetrics) : taskMetrics.totalWords;
  const payables = stage === 'stage1' ? 0 : taskMetrics.totalWords;
  return { receivables, payables };
}

function calculateWords(task) {
  const { metrics, stepsDates } = task;
  let receivables = calculateTranslationWords(metrics);
  receivables = stepsDates.length > 1 ? receivables + metrics.totalWords : receivables;
  const payables = stepsDates.length > 1 ? metrics.totalWords : 0;
  return { receivables, payables };
}

function calculateTranslationWords(metrics) {
  return Math.round(Object.keys(metrics).filter(item => item !== "totalWords")
    .reduce((prev, cur) => {
      return prev + metrics[cur].value * metrics[cur].client;
    }, 0));
}

function setStepsProgress(symbol, docs) {
  const prop = symbol === 'translation' ? 'ConfirmedWordCount' : 'Reviewer1ConfirmedWordCount';
  const totalProgress = docs.reduce((acc, cur) => {
    acc.wordsDone = acc.wordsDone ? acc.wordsDone + +cur[prop] : +cur[prop];
    acc.totalWordCount = acc.totalWordCount ? acc.totalWordCount + +cur.TotalWordCount : +cur.TotalWordCount;
    return acc;
  }, {});
  let stepProgress = {};
  for (let doc of docs) {
    stepProgress[doc.DocumentGuid] = {
      wordsDone: +doc[prop], totalWordCount: +doc.TotalWordCount, fileName: doc.DocumentName
    };
  }
  return { ...stepProgress, ...totalProgress };
}

const setProjectFinanceData = async (projectData) => {
  const { customer, steps, industry, tasks } = projectData;
  const client = await Clients.findOne({ _id: customer });
  const currencyRatio = await CurrencyRatio.findOne();
  const { rates, defaultPricelist, currency } = client;
  const pricelist = await Pricelist.findOne({ _id: defaultPricelist });
  for (let [index, { serviceStep, finance, sourceLanguage, targetLanguage, clientRate, ...rest }] of steps.entries()) {
    const { taskId } = rest;
    let { metrics } = tasks.find(item => item.taskId === taskId);
    sourceLanguage = await Languages.findOne({ symbol: sourceLanguage });
    targetLanguage = await Languages.findOne({ symbol: targetLanguage });
    const { step, unit, size } = serviceStep;
    const dataForComparison = {
      sourceLanguage,
      targetLanguage,
      step,
      unit,
      size: size ? size : 1,
      industry: industry._id,
      currency
    }
    let row = getPriceFromClientRates(rates.pricelistTable, dataForComparison);
    if (!row) {
      row = getPriceFromPricelist(pricelist, dataForComparison, currencyRatio);
    }
    if (rest.memoqProjectId) {
      steps[index].clientRate = {
        value: row,
        min: 0,
        active: true,
      };
      finance.Wordcount.receivables = getRelativeQuantity(metrics);
      // finance['Quantity(relative)'] = getRelativeQuantity(metrics);
      finance.Wordcount.payables = rest.totalWords;
      // finance['Quantity(total)'] = rest.totalWords;
      finance.subtotal = finance.rate * finance.Wordcount.receivables;
    }
  }
  return steps;
}

const getPriceFromClientRates = (pricelistTable, data) => {
  const { sourceLanguage, targetLanguage, step, unit, size } = data;
  return pricelistTable.find(row => (
    row.sourceLanguage.toString() === sourceLanguage.toString() &&
    row.targetLanguage.toString() === targetLanguage.toString() &&
    row.step.toString() === step.toString() &&
    row.unit.toString() === unit.toString() &&
    row.size.toString === size.toString()
  ));
}

const getPriceFromPricelist = (pricelist, data, currencyRatio) => {
  const { basicPricesTable, stepMultipliersTable, industryMultipliersTable } = pricelist;
  const { sourceLanguage, targetLanguage, step, unit, size, industry, currency } = data;
  let row = basicPricesTable.find(langPair => (
    `${langPair.sourceLanguage} ${langPair.targetLanguage}` === `${sourceLanguage} ${targetLanguage}`
  ));
  if (!row) row = {
    euroBasicPrice: 1,
    usdBasicPrice: currencyRatio.USD,
    gbpBasicPrice: currencyRatio.GBP
  };
  const { multiplier: stepMultiplier } = stepMultipliersTable.find(item => (
    `${item.step} ${item.unit} ${item.size}` === `${step} ${unit} ${size}`
  ));
  const { multiplier: industryMultiplier } = industryMultipliersTable.find(item => (
    item.industry.toString() === industry.toString()
  ));
  const basicPrice = getCorrectBasicPrice(row, currency);
  return multiplyPrices(basicPrice, stepMultiplier, industryMultiplier);
}

const getCorrectBasicPrice = (basicPriceRow, currency) => {
  if (currency === 'USD') return basicPriceRow.usdBasicPrice;
  else if (currency === 'EUR') return basicPriceRow.euroBasicPrice;
  else return basicPriceRow.gbpBasicPrice;
}

const getRelativeQuantity = (metrics) => {
  delete metrics.totalWords
  let counter = 0
  for (let item in metrics) {
    if (metrics.hasOwnProperty(item)) {
      counter += (metrics[item].value * metrics[item].client) / 100
    }
  }
  return counter;
}

module.exports = { updateProjectMetrics, getProjectWithUpdatedFinance };
