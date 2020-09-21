function getTasksWithFinanceUpdated (step, project) {
  let { tasks, steps } = project;
  const taskIndex = tasks.findIndex(item => item.taskId === step.taskId);
  const taskSteps = steps.filter(item => item.taskId === step.taskId);
  tasks[taskIndex].finance.Price = getTasksFinancePrice(taskSteps);
  return tasks;
}

function getTasksFinancePrice (steps) {
  const receivables = +(steps.reduce((prev, cur) => {
    return prev + cur.finance.Price.receivables;
  }, 0).toFixed(2));
  const payables = +(steps.reduce((prev, cur) => {
    return prev + cur.finance.Price.payables;
  }, 0).toFixed(2));
  return { receivables, payables };
}

module.exports = { getTasksWithFinanceUpdated };
