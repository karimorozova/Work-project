function getStepsWithFinanceUpdated(step, project) {
  let { steps } = project;
  const task = project.tasks.find(item => item.taskId === step.taskId);
  const isForCatWordcount = step.hasOwnProperty('totalWords');
  const { receivables, payables } = isForCatWordcount ? getWordsPrices(step, task.metrics) : getPrices(step);
  // console.log({ receivables, payables });
  const stepIndex = steps.findIndex(item => item.id === step._id);
  steps[stepIndex] = {
    ...step,
    finance: {
      ...step.finance, Price: { receivables, payables }
    }
  };
  // console.log('FINAL', steps[stepIndex]);
  return steps;
}

function getPrices(step) {
  const { clientRate, vendorRate, finance } = step;
  let receivables = +finance.Price.receivables;
  let payables = +finance.Price.payables;
  const isHours = step.hasOwnProperty('hours');
  if (clientRate) {
    const clientValue = isHours ? +(step.hours * clientRate.value).toFixed(2) : clientRate.value;
    receivables = clientValue > clientRate.min ? clientValue : clientRate.min;
  }
  if (vendorRate) {
    const vendorValue = isHours ? +(step.hours * vendorRate.value).toFixed(2) : vendorRate.value;
    payables = vendorValue > vendorRate.min ? vendorValue : vendorRate.min;
  }
  return { receivables, payables }
}

function getWordsPrices(step, metrics) {
  const { clientRate, vendorRate } = step;
  let receivables = +step.finance.Wordcount.receivables * clientRate.value
  const doesStepHasVendorRate = vendorRate.hasOwnProperty('value');
  let payables = doesStepHasVendorRate ? +step.finance.Wordcount.payables * +vendorRate.value : 0;
  let wordsSum = 0;
  console.log({ receivables, payables });
  if (step.name === "Translation") {
    for (let key in metrics) {
      if (key !== 'totalWords') {
        receivables += +metrics[key].value * +metrics[key].client * +clientRate.value;
        payables += doesStepHasVendorRate ? +metrics[key].value * +metrics[key].vendor * +vendorRate.value
          : +metrics[key].value;
        wordsSum += +metrics[key].value;
      }
    }
    receivables += +(+step.totalWords - +wordsSum) * +clientRate.value;
    payables += doesStepHasVendorRate ? +(+step.totalWords - +wordsSum) * +vendorRate.value
      : +(+step.totalWords - +wordsSum);
  }
  return {
    receivables: parseFloat(receivables.toFixed(2)),
    payables: parseFloat(payables.toFixed(2))
  };
}

module.exports = { getStepsWithFinanceUpdated }
