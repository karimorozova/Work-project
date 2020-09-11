const { payablesCalc, getVendorRate } = require('../calculations');
const { stepMiddleAssignNotification, stepMiddleReassignedNotification } = require('../utils');
const { updateMemoqProjectUsers } = require('../services/memoqs/projects');

async function reassignVendor(project, reassignData) {
    try {
        const { step, vendor, isStart, isPay, reason, progress } = reassignData;
        let { steps, tasks } = project;
        let taskIndex = tasks.findIndex(item => item.taskId === step.taskId);
        const newStep = getNewStep({isStart, progress, step, vendor, project, task: tasks[taskIndex]});
        const updatedStep = updateCurrentStep({step, isStart, isPay, progress});
        const stepIndex = steps.findIndex(item => item.stepId === step.stepId);
      steps.splice(stepIndex, 1, updatedStep, newStep);
      await updateMemoqProjectUsers(steps);
      tasks[taskIndex].finance.Price = getTaskFinance(steps, tasks[taskIndex].taskId);
        tasks[taskIndex].status = "Created";
        await stepMiddleReassignedNotification(updatedStep, reason, isPay);
        await stepMiddleAssignNotification(newStep, isStart);
        return { steps, tasks };
    } catch(err) {
        console.log(err);
        console.log("Error in reassignVendor");
    }
}

function updateCurrentStep({step, isStart, isPay, progress}) {
  let updatedStep = JSON.parse(JSON.stringify(step));
  const { payables, receivables } = updatedStep.finance.Price;
    updatedStep.finance.Price.receivables = 0;
    if(+progress) {
        updatedStep.status = "Cancelled Halfway";
        updatedStep.finance.Price.halfPayables = isPay ? +(payables*progress/100).toFixed(2) : 0;
        updatedStep.finance.Price.halfReceivables = !isStart ? +(receivables*progress/100).toFixed(2) : 0;
    } else {
        updatedStep.status = "Cancelled";
        updatedStep.finance.Price.payables = isPay ? +(payables*progress/100).toFixed(2) : 0;
        updatedStep.finance.Price.payables = !isStart ? +(payables*progress/100).toFixed(2) : 0;
    }
    updatedStep.progress = getUpdatedStepProgress(step, progress);
    return updatedStep;
}

function getUpdatedStepProgress(step, progress) {
    if(step.serviceStep.calculationUnit === "Words") {
        let updatedProgress = {...step.progress};
        updatedProgress.wordsDone = +(progress*step.progress.totalWordCount/100).toFixed(2);
        return updatedProgress;
    }
    return progress;
}

function getNewStep({step, vendor, isStart, progress, project, task}) {
    const { _id, ...stepInfo } = {...step};
    const stepId = step.stepId+'-R';
    let newStep = {
        ...stepInfo,
        stepId,
        status: 'Created',
        vendor,
        vendorsClickedOffer: [],
        isVendorRead: false,
        progress: getNewStepProgress(step, progress, isStart)
    };
    const stepWithPaybles = getStepPayables({task, step: newStep, project})
    if(!isStart && progress > 0) {
        return updateFinanceForNewStep(stepWithPaybles, progress);
    }
    return stepWithPaybles;
}

function getNewStepProgress(step, progress, isStart) {
    if(!isStart) {
        return getUpdatedStepProgress(step, progress);
    }
    let newProgress = 0;
    if(step.serviceStep.calculationUnit === "Words") {
        newProgress = {...step.progress, wordsDone: 0}
    }
    return newProgress;
}

function getStepPayables({task, step, project}) {
    const unit = step.serviceStep.calculationUnit;
    if(unit === 'Words') {
        return payablesCalc({metrics: task.metrics, project, step});
    } else {
        const ratesProp = unit === 'Packages' ? 'monoRates' : 'hoursRates';
        const { payables, vendorRate } = getVendorRate({
            ...step, ratesProp, industryId: project.industry.id, step: step.serviceStep
        })
        const Price = { ...step.finance.Price, payables };
        return {
          ...step,
          finance: { ...step.finance, Price },
          vendorRate
        }
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
