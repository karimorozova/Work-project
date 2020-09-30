const { updateProject } = require("./getProjects");
const { getFittingVendor, checkIsSameVendor } = require('../сalculations/vendor');
const { getStepFinanceData } = require('../сalculations/finance');
const { gatherServiceStepInfo, getFinanceForCustomUnits, getProjectFinance } = require('./helpers');
const ObjectId = require('mongodb').ObjectID;

async function createTasksAndStepsForCustomUnits (allInfo) {
  const {
    project,
    stepsAndUnits,
  } = allInfo;
  try {
    const { customer: { _id: customer }, industry } = project;
    let steps = [];
    let tasksWithoutFinance = await getTasksForCustomUnits({
      ...allInfo,
      projectId: project.projectId,
    });
    if (stepsAndUnits.length === 2) {
      steps = await getStepsForDuoUnits(
        { ...allInfo, customer, industry, tasks: tasksWithoutFinance });
    } else {
      steps = await getStepsForMonoUnits(
        { ...allInfo, customer, industry, tasks: tasksWithoutFinance });
    }
    steps = checkIsSameVendor(steps);
    const tasks = tasksWithoutFinance.map(item =>
      getFinanceForCustomUnits(item, steps)
    );
    const projectFinance = getProjectFinance(tasks, project.finance);
    return updateProject(
      { _id: project.id },
      { finance: projectFinance, $push: { tasks: tasks, steps: steps } }
    );
  } catch (err) {
    console.log(err);
    console.log("Error in createTasksWithHoursUnit");
  }
}

async function getTasksForCustomUnits (tasksInfo) {
  const {
    stepsAndUnits,
    projectId,
    service,
    targets,
    source,
    stepsDates,
    taskRefFiles,
  } = tasksInfo;
  let tasks = [];
  let tasksLength = tasksInfo.project.tasks.length + 1;
  for (let i = 0; i < targets.length; i++) {
    const idNumber = tasksLength < 10 ? `T0${tasksLength}` : `T${tasksLength}`;
    const taskId = projectId + ` ${idNumber}`;
    tasks.push({
      taskId,
      targetLanguage: targets[i].symbol,
      sourceLanguage: source.symbol,
      refFiles: taskRefFiles,
      service,
      stepsAndUnits,
      projectId,
      start: stepsDates[0].start,
      deadline: stepsDates[stepsDates.length - 1].deadline,
      finance: {
        Wordcount: { receivables: "", payables: "" },
        Price: { receivables: "", payables: "" }
      },
      status: "Created"
    });
    tasksLength++;
  }
  return tasks;
}

async function getStepsForMonoUnits (allInfo, common = false) {
  let { tasks, stepsDates, industry, customer } = allInfo;
  const steps = [];
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    let { stepsAndUnits, sourceLanguage, targetLanguage } = task;
    let serviceStep = stepsAndUnits.find(item => item.hours);
    const stepName = serviceStep.step;
    serviceStep = await gatherServiceStepInfo(serviceStep);
    const { step, hours, size } = serviceStep;
    const vendorId = await getFittingVendor({ sourceLanguage, targetLanguage, step, industry });
    const { finance, clientRate, vendorRate, vendor } = await getStepFinanceData({
      customer, industry, serviceStep, task, vendorId, quantity: hours
    });
    steps.push({
      ...task,
      start: common ? stepsDates[1].start : stepsDates[0].start,
      deadline: common ? stepsDates[1].deadline : stepsDates[0].deadline,
      stepId: `${tasks[i].taskId} S01`,
      serviceStep,
      name: stepName,
      vendor: ObjectId(vendor),
      vendorRate,
      clientRate,
      hours,
      size: size || 1,
      finance: finance,
      progress: 0,
      check: false,
      vendorsClickedOffer: [],
      isVendorRead: false
    });
  }
  return steps;
}

async function getStepsForDuoUnits (allInfo) {
  const { tasks, stepsAndUnits, stepsDates, industry, customer } = allInfo;
  const steps = [];
  for (let i = 0; i < stepsAndUnits.length; i++) {
    const task = tasks.length === 2 ? tasks[i] : tasks[0];
    const stepsIdCounter = i + 1 < 10 ? `S0${i + 1}` : `S${i + 1}`;
    const stepId = `${task.taskId} ${stepsIdCounter}`;
    let serviceStep = stepsAndUnits[i];
    const stepName = serviceStep.step;
    serviceStep = await gatherServiceStepInfo(serviceStep);
    const { sourceLanguage, targetLanguage } = task;
    const { step } = serviceStep;
    const key = serviceStep.hasOwnProperty('quantity') ? 'quantity' : 'hours';
    const quantity = serviceStep[key];
    const vendorId = await getFittingVendor({ sourceLanguage, targetLanguage, step, industry });
    const { finance, clientRate, vendorRate, vendor } = await getStepFinanceData({
      customer, industry, serviceStep, task, vendorId, quantity
    });
    steps.push(
      {
        ...task,
        stepId,
        serviceStep,
        name: stepName,
        start: stepsDates[0].start,
        deadline: stepsDates[0].deadline,
        [key]: quantity,
        size: serviceStep.size || 1,
        vendor: ObjectId(vendor),
        vendorRate,
        clientRate,
        finance,
        progress: 0,
        check: false,
        vendorsClickedOffer: [],
        isVendorRead: false,
      });
  }
  return steps;
}

module.exports = { createTasksAndStepsForCustomUnits };
