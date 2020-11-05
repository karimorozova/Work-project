const { updateProject } = require("./getProjects");
const { getFittingVendor, checkIsSameVendor } = require('../сalculations/vendor');
const { getStepFinanceData } = require('../сalculations/finance');
const { gatherServiceStepInfo, getFinanceForCustomUnits, getProjectFinance } = require('./helpers');
const { getTasksForCustomUnits, getStepsForDuoUnits } = require('./create');
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

async function getStepsForMonoUnits (allInfo, common = false) {
  let { tasks, stepsDates, industry, customer } = allInfo;
  const steps = [];
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    let { stepsAndUnits, sourceLanguage, targetLanguage } = task;
    let serviceStep = stepsAndUnits.find(item => item.hours);
    serviceStep = await gatherServiceStepInfo(serviceStep);
    const { step, hours, size, title } = serviceStep;
    const stepName = title;
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


module.exports = { createTasksAndStepsForCustomUnits, getStepsForDuoUnits, getTasksForCustomUnits };
