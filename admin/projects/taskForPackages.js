const { updateProject } = require("./getProjects");
const { getFittingVendor, checkIsSameVendor } = require('../сalculations/vendor');
const { getStepFinanceData } = require('../сalculations/finance');
const { gatherServiceStepInfo, getFinanceForCustomUnits, getProjectFinance } = require('./helpers');
const { getStepsForDuoUnits, getTasksForCustomUnits } = require('./taskForCommon');
const ObjectId = require('mongodb').ObjectID;

async function createTasksWithPackagesUnit (allInfo) {
  const { project, stepsAndUnits, stepsDates } = allInfo;
  try {
    const { customer: { _id: customer }, industry, discounts } = project;
    const tasksWithoutFinance = await getTasksForCustomUnits({ ...allInfo, projectId: project.projectId });
    let steps = stepsAndUnits.length === 2 ? await getStepsForDuoUnits({
        tasks: tasksWithoutFinance,
        customer,
        stepsDates,
        stepsAndUnits,
        industry,
        discounts,
      })
      : await getStepsForMonoStepPackages({
        tasks: tasksWithoutFinance,
        customer,
        stepsDates,
        industry,
        discounts,
      });
    steps = checkIsSameVendor(steps);
    const tasks = tasksWithoutFinance.map(item =>
      getFinanceForCustomUnits(item, steps)
    );
    const projectFinance = getProjectFinance(tasks, project.finance);
    return await updateProject(
      { _id: project.id },
      { finance: projectFinance, $push: { tasks: tasks, steps: steps } }
    );
  } catch (err) {
    console.log(err);
    console.log("Error in createTasksWithPackagesUnit");
  }
}

async function getStepsForMonoStepPackages(
  { tasks, stepsDates, industry, customer, discounts }, common = false) {
  const steps = [];
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    let { stepsAndUnits, sourceLanguage, targetLanguage } = task;
    let serviceStep = stepsAndUnits.find(item => item.unit === "Packages");
    const stepName = serviceStep.step;
    serviceStep = await gatherServiceStepInfo(serviceStep);
    const { step, size, quantity } = serviceStep;
    const vendorId = await getFittingVendor({ sourceLanguage, targetLanguage, step, industry });
    const { finance, clientRate, vendorRate, vendor } = await getStepFinanceData({
      customer, industry, serviceStep, task, vendorId, quantity, discounts
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
