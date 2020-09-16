const { getProject, updateProject } = require('./getProjects');
const { Step, Units } = require('../models');
const { setStepFinanceData } = require('../сalculations/finance');
const { receivablesCalc, setTaskMetrics } = require('../сalculations/wordcount');
const { getFittingVendor, checkIsSameVendor } = require('../сalculations/vendor');
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
        const { AnalysisResultForLang } = analysis;
        if (analysis && AnalysisResultForLang) {
          const taskMetrics = getTaskMetrics({ task, matrix: project.customer.matrix, analysis });
          task.metrics = !task.finance.Price.receivables ? { ...taskMetrics } : task.metrics;
          steps = await getTaskSteps(steps, task, industry, customer);
          const taskSteps = steps.filter(step => step.taskId === task.taskId);
          task.finance = {
            Wordcount: setTaskFinance(taskSteps, 'Wordcount'),
            Price: setTaskFinance(taskSteps, 'Price'),
          };
        } else {
          isMetricsExist = false;
        }
      }
    }
    steps = checkIsSameVendor(steps);
    return await updateProject({ "_id": projectId }, { tasks, steps, isMetricsExist });
  } catch (err) {
    console.log(err);
    console.log("Error in updateProjectMetrics");
  }
}

function getTaskMetrics ({ task, matrix, analysis }) {
  const { AnalysisResultForLang } = analysis;
  let targetMetrics = AnalysisResultForLang;
  if (Array.isArray(AnalysisResultForLang)) {
    targetMetrics = AnalysisResultForLang.find(({ TargetLangCode }) => TargetLangCode === task.memoqTarget);
  }
  const { Summary } = targetMetrics;
  const metrics = Object.keys(Summary).reduce((acc, cur) => {
    const { SourceWordCount } = Summary[cur];
    return cur !== 'Fragments' ? { ...acc, [cur]: +SourceWordCount } : acc;
  }, {});
  const memoqFilledMetrics = getFilledMemoqMetrics(metrics);
  let taskMetrics = setTaskMetrics({ metrics: memoqFilledMetrics, matrix, prop: "client" });
  return { ...taskMetrics, totalWords: metrics.All };
}

function getFilledMemoqMetrics (metrics) {
  const { Hit50_74, Hit101, Hit100, NoMatch, Repetition, Hit75_84, Hit85_94, XTranslated, Hit95_99 } = metrics;
  return {
    xTranslated: { text: "X translated", value: +XTranslated },
    repeat: { text: "Repetition", value: +Repetition },
    contextMatch: { text: "Context match", value: +Hit101 },
    repeat100: { text: "100%", value: +Hit100 },
    repeat50: { text: "50-74%", value: +Hit50_74 },
    repeat75: { text: "75-84%", value: +Hit75_84 },
    repeat85: { text: "85-94%", value: +Hit85_94 },
    repeat95: { text: "95-99%", value: +Hit95_99 },
    noMatch: { text: "No match", value: +NoMatch }
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
    return { ...projectToUpdate, tasks, steps };
  } catch (err) {
    console.log(err);
    console.log("Error in getProjectWithUpdatedFinance");
  }
}

async function getTaskSteps (steps, task, industry, customer) {
  const { sourceLanguage, targetLanguage, metrics } = task;
  let updatedSteps = JSON.parse(JSON.stringify(steps));
  const stepsAndUnits = JSON.parse(task.stepsAndUnits);
  let counter = 1;
  for (let i = 0; i < task.stepsDates.length; i++) {
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
      memoqDocIds: task.memoqDocs.map(({ DocumentGuid }) => DocumentGuid),
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
  }
  return updatedSteps;
}

function setStepsProgress (symbol, docs) {
  const prop = symbol === 'translation' ? 'ConfirmedWordCount' : 'Reviewer1ConfirmedWordCount';
  const totalProgress = docs.reduce((acc, cur) => {
    acc.wordsDone = acc.wordsDone ? acc.wordsDone + +cur[prop] : +cur[prop];
    const { TotalWordCount } = cur;
    acc.totalWordCount = acc.totalWordCount ? acc.totalWordCount + +TotalWordCount : +TotalWordCount;
    return acc;
  }, {});
  let stepProgress = {};
  for (let doc of docs) {
    const { DocumentGuid, TotalWordCount, DocumentName } = doc;
    stepProgress[DocumentGuid] = {
      wordsDone: +doc[prop], totalWordCount: +TotalWordCount, fileName: DocumentName
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
  }, {});
};

const getStepUnitsType = (stepUnits) => {
  const isObject = stepUnits.unit;
  if (isObject) {
    return 'object';
  } else {
    return 'json';
  }
};

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
};

module.exports = { updateProjectMetrics, getProjectWithUpdatedFinance };
