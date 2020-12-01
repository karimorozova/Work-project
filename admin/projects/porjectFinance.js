const { updateProject, getProjectAfterUpdate } = require('./getProjects');
const { getPriceAfterApplyingDiscounts } = require('./helpers');
const { Projects } = require('../models');

async function getProjectAfterFinanceUpdated ({ project, steps, tasks }) {
  try {
    let { finance, isPriceUpdated, status, discounts } = project;
    finance.Price = getProjectFinancePrice(tasks, discounts);
    const checkStatuses = ['Quote sent', 'Approved'];
    isPriceUpdated = checkStatuses.indexOf(status) !== -1;
    return await updateProject({ '_id': project.id }, { finance, steps, tasks, isPriceUpdated });
  } catch (err) {
    console.log(err);
        console.log("Error in getProjectAfterFinanceUpdated");
    }
}

function getProjectFinancePrice (tasks, discounts = []) {
  const notCancelledTasks = tasks.filter(item => item.status !== 'Cancelled');
  let receivables = +(notCancelledTasks.reduce((prev, cur) => {
    if (cur.status === 'Cancelled Halfway') {
      return prev + cur.finance.Price.halfReceivables;
    }
    return prev + cur.finance.Price.receivables;
  }, 0).toFixed(2));
  const payables = +(notCancelledTasks.reduce((prev, cur) => {
    if (cur.status === 'Cancelled Halfway') {
      return prev + cur.finance.Price.halfPayables;
    }
    return prev + cur.finance.Price.payables;
    }, 0).toFixed(2));
  receivables = discounts.length ? getPriceAfterApplyingDiscounts(discounts, receivables) : receivables;
    return { receivables, payables };
}

function getUpdatedProjectFinance(tasks) {
    let receivables = 0;
  let payables = 0;
  for (let task of tasks) {
    if (task.status !== 'Cancelled') {
      receivables += task.status === 'Cancelled Halfway' ? +task.finance.Price.halfReceivables : receivables;
      payables += task.status === 'Cancelled Halfway' ? +task.finance.Price.halfPayables : payables;
    }
  }
  return { receivables: +receivables.toFixed(2), payables: +payables.toFixed(2) };
}

const updateProjectFinanceOnDiscountsUpdate = async (_id, updatedDiscounts) => {
  let project = await Projects.findOne({ _id });
  let { finance, tasks, steps } = project;
  const {
    steps: updatedSteps,
    tasks: updatedTasks,
    finance: updatedFinance
  } = recalculateProjectFinance(finance, tasks, steps, updatedDiscounts);

  return await getProjectAfterUpdate({ _id }, {
    finance: updatedFinance,
    tasks: updatedTasks,
    steps: updatedSteps,
    discounts: updatedDiscounts
  });
};

const recalculateProjectFinance = (finance, tasks, steps, discounts = []) => {
  for (let step of steps) {
    let { finance: { Price: { receivables } }, clientRate: { value } } = step;
    const multiplier = findStepMultiplier(step);
    receivables = +multiplier * +value;
    if (discounts.length) {
      step.finance.Price.receivables = getPriceAfterApplyingDiscounts(discounts, receivables);
    } else {
      step.finance.Price.receivables = receivables;
    }
  }
  for (let task of tasks) {
    const { taskId } = task;
    const taskSteps = steps.filter(step => step.taskId === taskId);
    task.finance.Price.receivables = sumReceivables(taskSteps);
  }
  finance.Price.receivables = sumReceivables(tasks);

  return { steps, tasks, finance };

  function sumReceivables(arr) {
    let value = 0;
    for (let { finance: { Price: { receivables } } } of arr) {
      value += receivables;
    }
    return value;
  }
};

const findStepMultiplier = (step) => {
  if (step.finance.Wordcount.receivables === 0) {
    if (step._doc.hasOwnProperty('quantity')) {
      return +step.quantity;
    } else if (step._doc.hasOwnProperty('hours')) {
      return +step.hours;
    }
  } else {
    return step.finance.Wordcount.receivables;
  }
}

module.exports = { getProjectAfterFinanceUpdated, getUpdatedProjectFinance, updateProjectFinanceOnDiscountsUpdate };
