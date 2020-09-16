const { Units } = require('../models');

async function getStepsWithFinanceUpdated (step, project) {
  let { steps } = project;
  const task = project.tasks.find(item => item.taskId === step.taskId);
  const unitType = await checkUnitType(step.serviceStep.unit);
  const { receivables, payables } = unitType === 'CAT Wordcount' ? getWordsPrices(step, task.metrics) :
    getPrices(step, unitType);
  const stepIndex = steps.findIndex(item => item.id === step._id);
  steps[stepIndex] = {
    ...step,
    finance: {
      ...step.finance, Price: { receivables, payables }
    }
  };
  return steps;
}

function getPrices (step, unitType) {
  const { clientRate, vendorRate, finance } = step;
  let receivables = +finance.Price.receivables;
  let payables = +finance.Price.payables;
  if (clientRate) {
    receivables = unitType === 'Packages' ? +(step.quantity * clientRate.value).toFixed(2) :
      +(step.hours * clientRate.value).toFixed(2);
  }
  if (vendorRate) {
    payables = unitType === 'Packages' ? +(step.quantity * vendorRate.value).toFixed(2) :
      +(step.hours * vendorRate.value).toFixed(2);
  }
  return { receivables, payables };
}

function getWordsPrices (step) {
  const { clientRate, vendorRate } = step;
  let receivables = 0;
  let payables = 0;
  if (step.name === "Translation") {
    receivables = +step.finance.Wordcount.receivables * clientRate.value;
    const doesStepHasVendorRate = vendorRate.hasOwnProperty('value');
    payables = doesStepHasVendorRate ? +step.finance.Wordcount.payables * +vendorRate.value : 0;
  }
  return {
    receivables: parseFloat(receivables.toFixed(2)),
    payables: parseFloat(payables.toFixed(2))
  };
}

const checkUnitType = async (unitId) => {
  const { type } = await Units.findOne({ _id: unitId });
  return type;
};

module.exports = { getStepsWithFinanceUpdated };
