const { payablesCalc } = require('../сalculations/wordcount');
const { getVendorRate } = require('../сalculations/general');
const { stepVendorsRequestSending, stepReassignedNotification } = require('../utils');

async function reassignVendor(project, reassignData) {
    try {
        const { step, vendor, isStart, isPay, reason, progress } = reassignData;
        let { steps, tasks } = project;
        let taskIndex = tasks.findIndex(item => item.taskId === step.taskId);
        const newStep = await getNewStep({isStart, progress, step, vendor, project, task: tasks[taskIndex]});
        const updatedStep = updateCurrentStep({step, isStart, isPay, progress});
        const stepIndex = steps.findIndex(item => item.stepId === step.stepId);
        steps.splice(stepIndex, 1, updatedStep, newStep);
        tasks[taskIndex].finance.Price = getTaskFinance(steps, tasks[taskIndex].taskId);
        tasks[taskIndex].status = "Created";
        await stepReassignedNotification(project, updatedStep, reason);
        await stepVendorsRequestSending(project, [newStep]);
        return { steps, tasks };
    } catch(err) {
        console.log(err);
        console.log("Error in getNewStep");
    }
}

function updateCurrentStep({step, isStart, isPay, progress}) {
    let updatedStep = JSON.parse(JSON.stringify(step));
    const { payables, receivables } = updatedStep.finance.Price; 
    updatedStep.finance.Price.receivables = 0;
    if(+progress) {
        updatedStep.status = "Cancelled Halfway";
        updatedStep.finance.Price.halfPayables = isPay ? +(payables*progress/100).toFixed(2) : 0;
        updatedStep.finance.Price.halfReceivables = isPay && !isStart ? +(receivables*progress/100).toFixed(2) : 0;
    } else {
        updatedStep.status = "Cancelled";
        updatedStep.finance.Price.payables = isPay ? +(payables*progress/100).toFixed(2) : 0;
    }
    return updatedStep;
}

async function getNewStep({step, vendor, isStart, progress, project, task}) {
    const { _id, ...stepInfo } = {...step};
    const stepId = step.stepId+'-R'
    try {
        let newStep = {
            ...stepInfo,
            stepId,
            status: 'Request Sent',
            vendor,
            vendorsClickedOffer: [],
            isVendorRead: false,
        };
        const stepWithPaybles = await getStepPayables({task, step: newStep, project})
        if(!isStart && progress > 0) {
            return updateFinanceForNewStep(stepWithPaybles, progress);
        }
        return stepWithPaybles;
    } catch(err) {
        console.log(err);
        console.log("Error in getNewStep");
    }
}

async function getStepPayables({task, step, project}) {
    const unit = step.serviceStep.calculationUnit;
    try {
        if(unit === 'Words') {
            return await payablesCalc({task, project, step: newStep});
        } else {
            const ratesProp = unit === 'Packages' ? 'monoRates' : 'hoursRates';
            const { payables, vendorRate } = getVendorRate({
                ...step, ratesProp, industryId: project.industry.id, step: step.serviceStep
            })
            const Price = { ...step.finance.Price, payables };
            return {
                ...step, 
                finance: {...step.finance, Price}, 
                vendorRate
            }
        }
    } catch(err) {
        console.log(err);
        console.log("Error in getStepPayables");
    }
}

function updateFinanceForNewStep(step, progress) {
    let { finance } = step;
    let { receivables, payables } = finance.Price;
    payables -= +(payables*progress/100).toFixed(2);
    receivables -= +(receivables*progress/100).toFixed(2);
    return {
        ...step,
        finance: {
            ...finance,
            Price: {receivables, payables}
        }
    }
}

function getTaskFinance(steps, taskId) {
    const taksSteps = steps.filter(item => item.taskId === taskId);
    const receivables = getSum(taksSteps, 'receivables');
    const payables = getSum(taksSteps, 'payables');
    return { receivables, payables };
}

function getSum(steps, prop) {
    return steps.reduce((acc, cur) => {
        let money = 0;
        if(prop === 'receivables') {
            money = cur.status !== 'Cancelled Halfway' ? cur.finance.Price.receivables : cur.finance.Price.halfReceivables;
        } else {
            money = cur.status !== 'Cancelled Halfway' ? cur.finance.Price.payables : cur.finance.Price.halfPayables;
        }
        return acc + money;
    }, 0)
}

module.exports = { reassignVendor }