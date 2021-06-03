const { updateProject } = require("./getProjects");
const { getFittingVendor, checkIsSameVendor } = require('../сalculations/vendor');
const { getStepFinanceData } = require('../сalculations/finance');
const { gatherServiceStepInfo, getFinanceForCustomUnits, getProjectFinance } = require('./helpers');
const { getStepsForDuoUnits, getTasksForCustomUnits } = require('./taskForCommon');
const ObjectId = require('mongodb').ObjectID;


async function createTasksWithPackagesUnit (allInfo, iterator = 0) {
  const { project, stepsAndUnits, stepsDates } = allInfo;
  try {
    const { customer: { _id: customer }, _id, industry, discounts, projectId, finance, minimumCharge } = project;
    const tasksWithoutFinanceOriginal = await getTasksForCustomUnits({ ...allInfo, projectId }, iterator);

    let tasksWithoutFinance = JSON.parse(JSON.stringify(tasksWithoutFinanceOriginal))
    let steps = stepsAndUnits.length === 2 ? await getStepsForDuoUnits({
        tasks: tasksWithoutFinance,
        customer,
        stepsDates,
        stepsAndUnits,
        industry,
        discounts,
        projectId: _id,
      })
      : await getStepsForMonoStepPackages({
        tasks: tasksWithoutFinance,
        customer,
        stepsDates,
        industry,
        discounts,
        projectId: _id,
      });
    steps = checkIsSameVendor(steps);

    const tasks = tasksWithoutFinanceOriginal.map(item =>
      getFinanceForCustomUnits(item, steps)
    );
    const { projectFinance, roi } = getProjectFinance(tasks, finance, minimumCharge);

    return await updateProject(
      { _id }, { finance: projectFinance, roi, $push: { tasks, steps } }
    );
  } catch (err) {
    console.log(err);
    console.log("Error in createTasksWithPackagesUnit");
  }
}

async function getStepsForMonoStepPackages({ tasks, stepsDates, industry, customer, discounts, projectId }, common = false) {
  const steps = [];
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    let { stepsAndUnits, sourceLanguage, targetLanguage } = task;
    let serviceStep = stepsAndUnits.find(item => item.unit === "Packages");
    const stepName = serviceStep.step;
    serviceStep = await gatherServiceStepInfo(serviceStep);
    const { step, size, quantity } = serviceStep;
    const vendorId = await getFittingVendor({ sourceLanguage, targetLanguage, step, industry });
    const { finance, clientRate, vendorRate, vendor, defaultStepPrice, nativeFinance, nativeVendorRate } = await getStepFinanceData({
      customer, industry, serviceStep, task, vendorId, quantity, discounts, projectId
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
      defaultStepPrice,
      vendorsClickedOffer: [],
      isVendorRead: false,
      nativeFinance,
      nativeVendorRate,
    });
  }
  return steps;
}

module.exports = { createTasksWithPackagesUnit };
