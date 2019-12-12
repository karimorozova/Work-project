function getStepsWithFinanceUpdated(step, project) {
    let { steps } = project;
    const task = project.tasks.find(item => item.taskId === step.taskId);
    const { receivables, payables } = task.service.calculationUnit === 'Words' ? getWordsPrices(step, task.metrics) : getPrices(step);
    const stepIndex = steps.findIndex(item => item.id === step._id);
    steps[stepIndex] = {
        ...step, 
        finance: {
            ...step.finance, Price: {receivables, payables}
        }
    };
    return steps;
}

function getPrices(step) {
    const { clientRate, vendorRate } = step;
    const clientValue = step.serviceStep.calculationUnit === 'Hours' ? +(step.hours*step.quantity*clientRate.value).toFixed(2) : clientRate.value;
    const vendorValue = step.serviceStep.calculationUnit === 'Hours' ? +(step.hours*step.quantity*vendorRate.value).toFixed(2) : vendorRate.value;
    const receivables = clientValue > clientRate.min ? clientValue : clientRate.min;
    const payables = vendorValue > vendorRate.min ? vendorValue : vendorRate.min;
    return { receivables, payables }
}

function getWordsPrices(step, metrics) {
    const { clientRate, vendorRate } = step;
    let receivables = metrics.totalWords*clientRate.value
    let payables = metrics.totalWords*vendorRate.value;
    let wordsSum = 0;
    if(step.catName === "translate1") {
        for(let key in metrics) {
            if(key !== 'totalWords' && key !== "nonTranslatable") {
                receivables += +metrics[key].value*metrics[key].client*clientRate.value;
                payables += +metrics[key].value*metrics[key].vendor*vendorRate.value;
                wordsSum += metrics[key].value;
            }
        }
        receivables += +(metrics.totalWords - metrics.nonTranslatable - wordsSum)*clientRate.value;
        payables += +(metrics.totalWords - metrics.nonTranslatable - wordsSum)*vendorRate.value;
    }
    receivables = receivables < clientRate.min ? clientRate.min : receivables;
    payables = payables < vendorRate.min ? vendorRate.min : payables;
    return { 
        receivables: parseFloat(receivables.toFixed(2)), 
        payables: parseFloat(payables.toFixed(2)) 
    };
}

module.exports = { getStepsWithFinanceUpdated }