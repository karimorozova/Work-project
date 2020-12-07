const { getProject, updateProject } = require('./getProjects');
const { Step, Units, Vendors } = require('../models');
const { getStepFinanceData } = require('../сalculations/finance');
const { receivablesCalc, setTaskMetrics } = require('../сalculations/wordcount');
const { getFittingVendor, checkIsSameVendor } = require('../сalculations/vendor');
const { getProjectAnalysis } = require('../services/memoqs/projects');
const { setTaskFinance, getProjectFinance } = require('./helpers');
const ObjectId = require('mongodb').ObjectID;

/**
 *
 * @param {ObjectId} projectId
 * @param {Array} tasks
 * @returns {Object} - returns an updated project
 */
async function updateProjectMetrics(projectId, tasks) {
  try {
    const project = await getProject({ "_id": projectId });
    let { steps, customer, tasks: existingTasks, industry, discounts, finance, minimumCharge } = project;
    if (!tasks) tasks = project.tasks.filter(task => !task.hasOwnProperty('metrics'));
    filterExistingTasks();
    let isMetricsExist = true;
    for (let task of tasks) {
      const { stepsAndUnits } = task;
      const isIncludesWordCount = stepsAndUnits.find(item => item.unit === 'CAT Wordcount');
      if (!!isIncludesWordCount && task.status === "Created") {
        const analysis = await getProjectAnalysis(task.memoqProjectId);
        const { AnalysisResultForLang } = analysis;
        if (analysis && AnalysisResultForLang) {
          const taskMetrics = getTaskMetrics({ task, matrix: project.customer.matrix, analysis });
          task.metrics = !task.finance.Price.receivables ? { ...taskMetrics } : task.metrics;
          let newSteps = await getTaskSteps(task, industry, customer, discounts);
          newSteps = checkIsSameVendor(newSteps);
          const stepWithVendor = newSteps.find(step => step.vendor);
          if (stepWithVendor) {
            const vendor = await Vendors.findOne({ _id: stepWithVendor.vendor._id });
            if (vendor) {
              task.metrics = setTaskMetrics({
                metrics: task.metrics,
                matrix: vendor.matrix,
                prop: 'vendor'
              });
            }
          }
          task.finance = {
            Wordcount: setTaskFinance(newSteps, 'Wordcount'),
            Price: setTaskFinance(newSteps, 'Price'),
          };
          steps.push(...newSteps);
        } else {
          isMetricsExist = false;
        }
      }
    }

    function filterExistingTasks() {
      const newTasksIds = tasks.map(i => i.taskId);
      existingTasks = existingTasks.filter(({ taskId }) => !newTasksIds.includes(taskId));
    }

    existingTasks.push(...tasks);
    const { projectFinance, roi } = getProjectFinance(existingTasks, finance, minimumCharge);
    return await updateProject({ "_id": projectId }, {
      tasks: existingTasks,
      steps,
      isMetricsExist,
      finance: projectFinance,
      roi
    });
  } catch (err) {
    console.log(err);
    console.log("Error in updateProjectMetrics");
  }
}

/**
 *
 * @param {Object} task
 * @param {Object} matrix
 * @param {Object} analysis
 * @returns {Object} - returns object with metrics and total words
 */
function getTaskMetrics({ task, matrix, analysis }) {
  const { AnalysisResultForLang } = analysis;
  let targetMetrics = AnalysisResultForLang;
  if(Array.isArray(AnalysisResultForLang)) {
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

/**
 *
 * @param {Object} metrics
 * @returns {Object} - returns updated metrics
 */
function getFilledMemoqMetrics(metrics) {
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

/**
 *
 * @param {Object} project
 * @returns {Object} - returns calculated project's tasks and steps
 */
async function getProjectWithUpdatedFinance(project) {
  let projectToUpdate = { ...project._doc, id: project.id };
  let { tasks, steps } = projectToUpdate;
  try {
    for (let step of steps) {
      const parsedStep = JSON.parse(JSON.stringify(step));
      if(!step.finance.Price.receivables && parsedStep.serviceStep.unit === 'CAT Wordcount') {
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

/**
 *
 * @param task
 * @param industry
 * @param customer
 * @param discounts
 * @returns {Promise<[]>}
 */
async function getTaskSteps(task, industry, customer, discounts) {
  const { sourceLanguage, targetLanguage, metrics, service, stepsAndUnits } = task;
  const newSteps = [];
  let counter = 1;
  for (let i = 0; i < task.stepsDates.length; i++) {
    let stepsIdCounter = counter < 10 ? `S0${counter}` : `S${counter}`;
    const { _id: stepId } = await Step.findOne({ title: stepsAndUnits[i].step });
    const { _id: unitId, type } = await Units.findOne({ type: stepsAndUnits[i].unit });
    const serviceStep = {
      step: ObjectId(stepId),
      unit: ObjectId(unitId),
      size: stepsAndUnits[i].size || 1,
      memoqAssignmentRole: i,
      title: stepsAndUnits[i].step
    };
    const quantity = getWordcountStepQuantity(type, metrics, stepsAndUnits[i]);
    const vendorId = await getFittingVendor({ sourceLanguage, targetLanguage, step: serviceStep.step, industry });
    const { finance, clientRate, vendorRate, vendor, defaultStepPrice } = await getStepFinanceData({
      customer, industry, serviceStep, task, vendorId, quantity, discounts
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
      defaultStepPrice,
      vendorRate,
      totalWords: quantity,
      check: false,
      vendorsClickedOffer: [],
      isVendorRead: false,
      service
    };
    if(type !== 'CAT Wordcount' && type !== 'Packages') {
      delete step.totalWords;
      Object.assign(step, { hours: stepsAndUnits[i].hours, size: stepsAndUnits[i].size });
    } else if(type === 'Packages') {
      delete step.totalWords;
      Object.assign(step, { quantity: stepsAndUnits[i].quantity, size: stepsAndUnits[i].size });
    } else {
      Object.assign(step, { totalWords: quantity, quantity });
    }
    // if (step.name !== "Translation") {
    //   const { _id } = await Units.findOne({ type: 'Packages' });
    //   step.serviceStep.unit = ObjectId(_id);
    // }
    newSteps.push(step);
    counter++;
  }
  return newSteps;
}

/**
 *
 * @param {String} symbol
 * @param {Array} docs
 * @returns {Object} - returns step's progress
 */
function setStepsProgress(symbol, docs) {
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

/**
 *
 * @param {String} type
 * @param {Object} metrics
 * @param {Object} stepAndUnit
 * @returns {Number} - returns correct amount of quantity
 */
const getWordcountStepQuantity = (type, metrics, stepAndUnit) => {
  let quantity = metrics.totalWords;
  switch (type) {
    case 'CAT Wordcount':
      return quantity;
    case 'Packages':
      quantity = stepAndUnit.quantity;
      return quantity;
    default:
      quantity = stepAndUnit.hours;
      return quantity;
  }
};

module.exports = { updateProjectMetrics, getProjectWithUpdatedFinance };
