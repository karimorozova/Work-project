const { getProjectAfterFinanceUpdated } = require("../projects/porjectFinance");
const { getStepFinanceData } = require('./finance');
const { setTaskFinance, getStepQuantity } = require('../projects/helpers');


async function getAfterHoursPayablesUpdated ({ project, step }) {
  let { tasks, steps, customer, industry } = project;
  const { serviceStep } = step;
  try {
    const taskIndex = tasks.findIndex(item => item.taskId === step.taskId);
    const stepIndex = steps.findIndex(item => item.taskId === step.taskId && item.stepId === step.stepId);
    const quantity = getStepQuantity(step);
    const { finance, vendorRate } = await getStepFinanceData({
      customer, industry, serviceStep, task: tasks[taskIndex], vendorId: step.vendor._id, quantity
    });
    steps[stepIndex].finance = finance;
    steps[stepIndex].vendorRate = vendorRate;
    const taskSteps = steps.filter(step => step.taskId === tasks[taskIndex].taskId);
    tasks[taskIndex].finance = {
      Wordcount: setTaskFinance(taskSteps, 'Wordcount'),
      Price: setTaskFinance(taskSteps, 'Price'),
    };
    return await getProjectAfterFinanceUpdated({ project, tasks, steps });
  } catch (err) {
    console.log(err);
    console.log('Error in getAfterPackagesPayablesUpdated');
  }
}

module.exports = { getAfterHoursPayablesUpdated };
