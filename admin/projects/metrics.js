const { getProject, updateProject } = require('./getProjects');
const { Step, Units } = require('../models');
const {
  setStepFinanceData,
  receivablesCalc,
  setTaskMetrics,
  getFittingVendor,
  checkIsSameVendor
} = require('../calculations');
const { getProjectAnalysis } = require('../services/memoqs/projects');
const ObjectId = require('mongodb').ObjectID;


async function updateProjectMetrics ({ projectId }) {
  try {
    const project = await getProject({ "_id": projectId });
    let { steps, tasks, customer, industry } = project;
    let isMetricsExist = true;
    for (let task of tasks) {
      let { stepsAndUnits } = task;
      const stepUnitType = getStepUnitsType(stepsAndUnits);
      let isIncludesWordCount = isIncludesWordcount(stepUnitType, stepsAndUnits);
      if (!!isIncludesWordCount && task.status === "Created") {
        const analysis = await getProjectAnalysis(task.memoqProjectId);
        if (analysis && analysis.AnalysisResultForLang) {
          const taskMetrics = getTaskMetrics({ task, matrix: project.customer.matrix, analysis });
          task.metrics = !task.finance.Price.receivables ? { ...taskMetrics } : task.metrics;
          steps = await getTaskSteps(steps, task, industry, customer);
          const taskSteps = steps.filter(step => step.taskId === task.taskId);
          task.finance = {
            Wordcount: setTaskFinance(taskSteps, 'Wordcount'),
            Price: setTaskFinance(taskSteps, 'Price'),
          }
        } else {
          isMetricsExist = false;
        }
      }
    }
    // let isWordFirst = false;
    // const lastTask = tasks[tasks.length - 1];
    // const { stepsAndUnits } = lastTask;
    // const stepUnitType = getStepUnitsType(stepsAndUnits);
    // switch (stepUnitType) {
    //   default:
    //   case 'json':
    //     const stepUnits = JSON.parse(lastTask.stepsAndUnits);
    //     if (stepUnits.length === 2) {
    //       isWordFirst = stepUnits[0].unit === 'CAT Wordcount' && stepUnits[1].unit !== 'CAT Wordcount';
    //     }
    //     break;
    //   case 'object':
    //     isWordFirst = false;
    // }
    // let lastSteps = [];
    // if (isWordFirst)
    //   for (let i = 0; i < 2; i++) lastSteps.push(steps.pop())
    // steps.push(...lastSteps);
    // steps = await setProjectFinanceData({ steps, customer, industry, tasks });
    steps = checkIsSameVendor(steps);
    return await updateProject({ "_id": projectId }, { tasks, steps, isMetricsExist });
  } catch (err) {
    console.log(err);
    console.log("Error in updateProjectMetrics");
  }
}

function getTaskMetrics ({ task, matrix, analysis }) {
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

function getFilledMemoqMetrics (metrics) {
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

async function getProjectWithUpdatedFinance (project) {
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

async function getTaskSteps (steps, task, industry, customer) {
  const serviceSteps = task.service.steps.reduce((acc, cur) => {
    return { ...acc, [cur.stage]: cur.step };
  }, {});
  const { sourceLanguage, targetLanguage, metrics } = task;
  let updatedSteps = JSON.parse(JSON.stringify(steps));
  const stepsAndUnits = JSON.parse(task.stepsAndUnits);
  let counter = 1;
  for (let i = 0; i < task.stepsDates.length; i++) {
    // const existedStep = updatedSteps.filter(item => item.taskId === task.taskId && item.name === serviceSteps[`stage${i + 1}`].title);
    // if (!existedStep.length) {
    let stepsIdCounter = counter < 10 ? `S0${counter}` : `S${counter}`;
    const { _id: stepId } = await Step.findOne({ title: stepsAndUnits[i].step });
    const { _id: unitId, type } = await Units.findOne({ type: stepsAndUnits[i].unit });
    const serviceStep = {
      step: ObjectId(stepId),
      unit: ObjectId(unitId),
      size: stepsAndUnits[i].size || 1,
      memoqAssignmentRole: i
    };
    const quantity = metrics.totalWords;
    const vendorId = await getFittingVendor({ sourceLanguage, targetLanguage, step: serviceStep.step, industry });
    const { finance, clientRate, vendorRate, vendor } = await setStepFinanceData({
      customer, industry, serviceStep, task, vendorId, quantity
    }, true);
    const step = {
      stepId: `${task.taskId} ${stepsIdCounter}`,
      taskId: task.taskId,
      serviceStep,
      name: stepsAndUnits[i].step,
      sourceLanguage,
      targetLanguage,
      memoqProjectId: task.memoqProjectId,
      memoqSource: task.memoqSource,
      memoqTarget: task.memoqTarget,
      memoqDocIds: task.memoqDocs.map(item => item.DocumentGuid),
      vendor: ObjectId(vendor),
      start: task.stepsDates[i].start || task.start,
      deadline: task.stepsDates[i].deadline,
      progress: setStepsProgress(serviceStep.symbol, task.memoqDocs),
      status: "Created",
      clientRate,
      finance,
      vendorRate,
      totalWords: quantity,
      check: false,
      vendorsClickedOffer: [],
      isVendorRead: false
    };
    if (type !== 'CAT Wordcount' && type !== 'Packages') {
      delete step.totalWords;
      Object.assign(step, { hours: stepsAndUnits[i].hours, size: stepsAndUnits[i].size });
    } else if (type === 'Packages') {
      delete step.totalWords;
      Object.assign(step, { quantity: stepsAndUnits[i].quantity, size: stepsAndUnits[i].size });
    } else {
      if (!step.hasOwnProperty('totalWords')) {
        Object.assign(step, { totalWords: quantity, quantity });
      }
    }
    updatedSteps.push(step);
    counter++;
    // } else {
    //   for (let step of updatedSteps) {
    //     if (step.taskId === task.taskId) {
    //       step.progress = setStepsProgress(serviceSteps[`stage${i + 1}`].symbol, task.memoqDocs);
    //     }
    //   }
    // }
  }
  return updatedSteps;
}

function getStepWordcount (taskMetrics, stage) {
  const receivables = stage === 'stage1' ? calculateTranslationWords(taskMetrics) : taskMetrics.totalWords;
  const payables = stage === 'stage1' ? 0 : taskMetrics.totalWords;
  return { receivables, payables };
}

function calculateWords (task) {
  const { metrics, stepsDates } = task;
  let receivables = calculateTranslationWords(metrics);
  receivables = stepsDates.length > 1 ? receivables + metrics.totalWords : receivables;
  const payables = stepsDates.length > 1 ? metrics.totalWords : 0;
  return { receivables, payables };
}

function calculateTranslationWords (metrics) {
  return Math.round(Object.keys(metrics).filter(item => item !== "totalWords")
    .reduce((prev, cur) => {
      return prev + +metrics[cur].value * +metrics[cur].client;
    }, 0));
}

function setStepsProgress (symbol, docs) {
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

const setTaskFinance = (steps, prop) => {
  return steps.reduce((acc, cur) => {
    const receivables = +cur.finance[prop].receivables;
    const payables = +cur.finance[prop].payables;
    acc.receivables = acc.receivables ? +(acc.receivables + receivables).toFixed(2) : receivables;
    acc.payables = acc.payables ? +(acc.payables + payables).toFixed(2) : payables;
    return acc;
  }, {})
}

const getStepUnitsType = (stepUnits) => {
  const isObject = stepUnits.unit;
  if (isObject) {
    return 'object';
  } else {
    return 'json';
  }
}

const isIncludesWordcount = (type, stepsAndUnits) => {
  let isIncludesWordCount;
  switch (type) {
    default:
    case 'object':
      isIncludesWordCount = stepsAndUnits.unit === 'CAT Wordcount';
      break;
    case 'json':
      stepsAndUnits = JSON.parse(stepsAndUnits);
      isIncludesWordCount = stepsAndUnits.find(item => item.unit === 'CAT Wordcount');
  }
  return isIncludesWordCount;
}

module.exports = { updateProjectMetrics, getProjectWithUpdatedFinance };
