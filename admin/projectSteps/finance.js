function getStepsWithFinanceUpdated(step, project) {
    let { steps } = project;
    const task = project.tasks.find(item => item.taskId === step.taskId);
    //S1
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
    const { clientRate, vendorRate, finance } = step;
    let receivables = +finance.Price.receivables;
    let payables = +finance.Price.payables;
    if(clientRate) {
        const clientValue = step.serviceStep.calculationUnit === 'Hours' ? +(step.hours*step.quantity*clientRate.value).toFixed(2) : clientRate.value;
        receivables = clientValue > clientRate.min ? clientValue : clientRate.min;
    }
    if(vendorRate) {
        const vendorValue = step.serviceStep.calculationUnit === 'Hours' ? +(step.hours*step.quantity*vendorRate.value).toFixed(2) : vendorRate.value;
        payables = vendorValue > vendorRate.min ? vendorValue : vendorRate.min;
    }
    return { receivables, payables }
}

function getWordsPrices(step, metrics) {
    const { clientRate, vendorRate } = step;
    let receivables = metrics.totalWords*clientRate.value
    let payables = metrics.totalWords*vendorRate.value;
    let wordsSum = 0;
    //step.name S2
    if(step.serviceStep.title === "translation") {
        for(let key in metrics) {
            if(key !== 'totalWords') {
                receivables += +metrics[key].value*metrics[key].client*clientRate.value;
                payables += +metrics[key].value*metrics[key].vendor*vendorRate.value;
                wordsSum += metrics[key].value;
            }
        }
        receivables += +(metrics.totalWords - wordsSum)*clientRate.value;
        payables += +(metrics.totalWords - wordsSum)*vendorRate.value;
    }
    receivables = receivables < clientRate.min ? clientRate.min : receivables;
    payables = payables < vendorRate.min ? vendorRate.min : payables;
    return { 
        receivables: parseFloat(receivables.toFixed(2)), 
        payables: parseFloat(payables.toFixed(2)) 
    };
}

module.exports = { getStepsWithFinanceUpdated }