const { payablesCalc } = require('../calculations');

async function reassignVendor(project, reassignData) {
    try {
        const { step, vendor, isStart, isPay, reason, progress } = reassignData;
        let { steps, tasks } = project;
        let taskIndex = tasks.findIndex(item => item.taskId === step.taskId);
        const newStep = await getNewStep({step, vendor, project, task: tasks[taskIndex]});
        const updatedStep = updateCurrentStep({step, isPay, progress});
        const stepIndex = steps.findIndex(item => item.stepId === step.stepId);
        steps.splice(stepIndex, 1, updatedStep, newStep);
        tasks[taskIndex].finance.Price = getTaskFinance(steps, tasks[taskIndex].taskId);
        tasks[taskIndex].status = "Created";
        return { steps, tasks };
    } catch(err) {
        console.log(err);
        console.log("Error in getNewStep");
    }
}

function updateCurrentStep({step, isPay, progress}) {
    let updatedStep = JSON.stringify(step);
    updatedStep = JSON.parse(updatedStep);
    const { payables, receivables } = updatedStep.finance.Price; 
    if(+progress) {
        updatedStep.status = "Cancelled Halfway";
        updatedStep.finance.Price.halfPayables = isPay ? payables*progress/100 : 0;
        updatedStep.finance.Price.halfReceivables = receivables*progress/100;
    } else {
        updatedStep.status = "Cancelled";
        updatedStep.finance.Price.payables = isPay ? payables*progress/100 : 0;
        updatedStep.finance.Price.receivables = 0;
    }
    return updatedStep;
}

async function getNewStep({step, vendor, isStart, progress, project, task}) {
    const { _id, ...stepInfo } = {...step};
    try {
        let newStep = {
            ...stepInfo,
            status: 'Request Sent',
            vendor,
            vendorsClickedOffer: [],
            isVendorRead: false,
        };
        return await payablesCalc({task, project, step: newStep});
    } catch(err) {
        console.log(err);
        console.log("Error in getNewStep");
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