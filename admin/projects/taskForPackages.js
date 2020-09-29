const { updateProject } = require("./getProjects");
const { getFittingVendor, checkIsSameVendor } = require('../сalculations/vendor');
const { getStepFinanceData } = require('../сalculations/finance');
const { gatherServiceStepInfo, getFinanceForCustomUnits, getProjectFinance } = require('./helpers');
const ObjectId = require('mongodb').ObjectID;

async function createTasksWithPackagesUnit (allInfo) {
  const { project, stepsAndUnits, stepsDates } = allInfo;
  try {
    const { customer: { _id: customer }, industry } = project;
    const tasksWithoutFinance = await getTasksForPackages({ ...allInfo, projectId: project.projectId });
    let steps = stepsAndUnits.length === 2 ? await getStepsForDuoStepPackages({
        tasks: tasksWithoutFinance,
        customer,
        stepsDates,
        stepsAndUnits,
        industry
      })
      : await getStepsForMonoStepPackages({
        tasks: tasksWithoutFinance,
        customer,
        stepsDates,
        industry
      });
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
    console.log("Error in createTasksWithPackagesUnit");
  }
}

async function getTasksForPackages (tasksInfo, common = false) {
  const { stepsAndUnits, projectId, service, targets, source, stepsDates, taskRefFiles } = tasksInfo;
  let tasks = [];
  let tasksLength = tasksInfo.project.tasks.length + 1;
  for (let i = 0; i < targets.length; i++) {
    const idNumber = tasksLength < 10 ? `T0${tasksLength}` : `T${tasksLength}`;
    const taskId = projectId + ` ${idNumber}`;
    tasks.push({
      taskId,
      sourceLanguage: source.symbol,
      targetLanguage: targets[i].symbol,
      refFiles: taskRefFiles,
      service,
      stepsAndUnits,
      languageForm: service.languageForm,
      projectId,
      start: common ? stepsDates[0].start : stepsDates[0].start,
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

async function getStepsForDuoStepPackages ({ tasks, stepsDates, stepsAndUnits, industry, customer }) {
  let counter = 1;
  const steps = [];
  for (let i = 0; i < stepsAndUnits.length; i++) {
    const task = tasks.length === 2 ? tasks[i] : tasks[0];
    const stepsIdCounter = counter < 10 ? `S0${counter}` : `S${counter}`;
    const stepId = `${task.taskId} ${stepsIdCounter}`;
    const { sourceLanguage, targetLanguage } = task;
    let serviceStep = stepsAndUnits[i];
    const stepName = serviceStep.step;
    serviceStep = await gatherServiceStepInfo(serviceStep);
    const { quantity, step, size } = serviceStep;
    const vendorId = await getFittingVendor({ sourceLanguage, targetLanguage, step, industry });
    const { finance, clientRate, vendorRate, vendor } = await getStepFinanceData({
      customer, industry, serviceStep, task, vendorId, quantity
    });
    steps.push({
      ...task,
      stepId,
      serviceStep,
      name: stepName,
      size,
      quantity,
      start: stepsDates[i].start,
      deadline: stepsDates[i].deadline,
      vendor: ObjectId(vendor),
      progress: 0,
      clientRate,
      vendorRate,
      finance,
      check: false,
      vendorsClickedOffer: [],
      isVendorRead: false
    });
    counter++;
  }
  return steps;
}

async function getStepsForMonoStepPackages ({ tasks, stepsDates, industry, customer }, common = false) {
  const steps = [];
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    let { stepsAndUnits, sourceLanguage, targetLanguage } = task;
    stepsAndUnits = JSON.parse(stepsAndUnits);
    let serviceStep = stepsAndUnits.find(item => item.unit === "Packages");
    const stepName = serviceStep.step;
    serviceStep = await gatherServiceStepInfo(serviceStep);
    const { step, size, quantity } = serviceStep;
    const vendorId = await getFittingVendor({ sourceLanguage, targetLanguage, step, industry });
    const { finance, clientRate, vendorRate, vendor } = await getStepFinanceData({
      customer, industry, serviceStep, task, vendorId, quantity
    });
    steps.push({
      ...task,
      stepId: `${tasks[i].taskId} S01`,
      serviceStep,
      name: stepName,
      start: common ? stepsDates[1].start : stepsDates[0].start,
      deadline: common ? stepsDates[1].deadline : stepsDates[0].deadline,
      size,
      quantity,
      vendor: ObjectId(vendor),
      progress: 0,
      clientRate,
      vendorRate,
      finance,
      check: false,
      vendorsClickedOffer: [],
      isVendorRead: false
    });
  }
  return steps;
}

module.exports = { createTasksWithPackagesUnit };
