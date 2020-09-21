const { Units } = require('../models');

async function getStepsWithFinanceUpdated (step, project) {
  let { steps } = project;
  const task = project.tasks.find(item => item.taskId === step.taskId);
  const unitType = await checkUnitType(step.serviceStep.unit);
  const { receivables, payables } = unitType === 'CAT Wordcount' && step.name === 'Translation' ?
    getWordsPrices(step, task.metrics)
    :
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
    if (unitType === 'CAT Wordcount') {
      receivables = +(step.totalWords * clientRate.value).toFixed(2);
    } else if (unitType === 'Packages') {
      receivables = +(step.quantity * clientRate.value).toFixed(2);
    } else {
      receivables = +(step.hours * clientRate.value).toFixed(2);
    }
  }
  if (vendorRate) {
    if (unitType === 'CAT Wordcount') {
      payables = +(step.totalWords * vendorRate.value).toFixed(2);
    } else if (unitType === 'Packages') {
      payables = +(step.quantity * vendorRate.value).toFixed(2);
    } else {
      payables = +(step.hours * vendorRate.value).toFixed(2);
    }
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
