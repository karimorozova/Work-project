const { Projects } = require('../models');
const { getProject, updateProject } = require('./getProjects');
const { notifyVendors } = require('./emails');

async function changeProjectProp(projectId, property) {
    const project = await getProject({"_id": projectId});
    let changedProject = {...project._doc};
    changedProject[property] = !changedProject[property]; 
    return await updateProject({"_id": projectId}, {...changedProject});
}

function cancelTasks(tasks, project) {
    let projectTasks = [...project.tasks];
    let projectSteps = [...project.steps];
    const tasksIds = tasks.map(item => item.taskId);
    const inCompletedSteps = projectSteps.filter(item => item.status !== "Completed" && tasksIds.indexOf(item.taskId) !== -1)
        .map(step => step.taskId + step.name);
    const cancelledSteps = updateStepsStatuses({stepIdentify: inCompletedSteps, steps: projectSteps, status: "Cancelled"});
    const changedSteps = updateAllSteps(cancelledSteps);
    const changedTasks = cancellCheckedTasks(tasksIds, projectTasks, changedSteps);
    return { changedTasks, changedSteps };
}

function cancellCheckedTasks(tasksIds, projectTasks, changedSteps) {
    return projectTasks.map(task => {
        if(tasksIds.indexOf(task.taskId) !== -1) {
            task.status = getTaskNewStatus(changedSteps, task.taskId);
            if(task.status === "Cancelled Halfway") {
                task.finance = getTaskNewFinance(changedSteps, task);
            }
        }
        return task;
    })
}

function getTaskNewFinance(changedSteps, task) {
    const  { wordValues, priceValues } = updateTaskNewFinance(changedSteps, task);
    const { finance } = task;
    const Wordcount = {...finance.Wordcount, halfReceivables: wordValues.receivables, halfPayables: wordValues.payables};
    const Price = {...finance.Price, halfReceivables: priceValues.receivables, halfPayables: priceValues.payables};
    const updatedFinance = {...finance, Wordcount, Price};
    return updatedFinance;
}

function updateTaskNewFinance(changedSteps, task) {
    let wordValues = {receivables: 0, payables: 0};
    let priceValues = {receivables: 0, payables: 0};
    const taskSteps = changedSteps.filter(item => item.taskId === task.taskId);
    for(let step of taskSteps) {
        if(step.status === "Cancelled Halfway") {
            wordValues.receivables+= +step.finance.Wordcount.halfReceivables;
            wordValues.payables+= +step.finance.Wordcount.halfPayables;
            priceValues.receivables+= +step.finance.Price.halfReceivables;
            priceValues.payables+= +step.finance.Price.halfPayables;
        } else {
            wordValues.receivables+= +step.finance.Wordcount.receivables;
            wordValues.payables+= +step.finance.Wordcount.payables;
            priceValues.receivables+= +step.finance.Price.receivables;
            priceValues.payables+= +step.finance.Price.payables;
        }
    }
    return { wordValues, priceValues };
}

function getTaskNewStatus(steps, taskId) {
    const taskSteps = steps.filter(item => item.taskId === taskId)
        .map(step => step.status);
    const cancelledSteps = taskSteps.filter(item => item === "Cancelled");
    const completedSteps = taskSteps.filter(item => item === "Completed");
    const halfCancelledSteps = taskSteps.filter(item => item === "Cancelled Halfway");
    if(completedSteps.length) {
        return "Ready for Delivery"
    }
    if(halfCancelledSteps.length) {
        return "Cancelled Halfway"
    }
    if(cancelledSteps.length === taskSteps.length) {
        return "Cancelled"
    }
}

function cancelSteps(checkedSteps, project) {
    const projectSteps = [...project.steps];
    const projectTasks = [...project.tasks];
    const stepIdentify = checkedSteps.map(item => {
        return item.taskId + item.name;
    })
    const changedCheckedSteps = updateStepsStatuses({stepIdentify, steps:projectSteps, status: "Cancelled"});
    const changedSteps = updateAllSteps(changedCheckedSteps);
    const changedTasks = cancelledTasks(changedSteps, projectTasks);
    return { changedSteps, changedTasks };
}

function cancelledTasks(changedSteps, arr) {
    const updated = arr.map(task => {
        if(checkAllStepsCancelled({changedSteps, task})) {
            task.status = "Cancelled";
            return task;
        }
        if(checkNoOpenSteps({changedSteps, task})) {
            task.status = "Ready for Delivery";
            task.finance = getTaskNewFinance(changedSteps, task);
        }
        return task
    })
    return updated;
}

function checkAllStepsCancelled({changedSteps, task}) {
    for(let step of changedSteps) {
        if(step.taskId === task.taskId && step.status !== "Cancelled") {
            return false;
        }
    }
    return true;
}

function checkNoOpenSteps({changedSteps, task}) {
    for(let step of changedSteps) {
        if(step.taskId === task.taskId && 
            (step.status !== "Completed" &&
            step.status !== "Cancelled Halfway")) {
                return false
            }
    }
    return true
}

function updateAllSteps(steps) {
    const translateSteps = steps.filter(item => item.name === "translate1").map(item => {
        return item.taskId + item.status;
    });
    return steps.map(step => {
        if(translateSteps.indexOf(step.taskId + "Cancelled") !== -1 || 
            translateSteps.indexOf(step.taskId + "Cancelled Halfway") !== -1) {
                step.status = "Cancelled";
            }
        return step;
    })  
}

function updateStepsStatuses({steps, status, stepIdentify}) {
    const updated = steps.map(item => {
        if(stepIdentify.indexOf(item.taskId + item.name) !== -1) {
            let newStatus = status;
            if(+item.progress.wordsDone > 0) {
                newStatus = "Cancelled Halfway";
                let finance = getStepNewFinance(item);
                return {...item._doc, status: newStatus, finance};
            }
            item.status = newStatus;
        }
        return item;
    })
    return updated;
}

function getStepNewFinance(step) {
    const { progress, finance } = step;
    const { Wordcount, Price } = finance;
    const done = progress.wordsDone/progress.wordsTotal;
    Wordcount.halfReceivables = Wordcount.receivables*done;
    Wordcount.halfPayables = Wordcount.payables*done;
    Price.halfReceivables = Price.receivables*done;
    Price.halfPayables = Price.payables*done;
    return { Wordcount, Price }
}

async function updateProjectStatus(id, status) {
    try {
        if(status !== "Cancelled") {
            return await updateProject({"_id": id}, { status });
        }
        const project = await getProject({"_id": id});
        const { tasks } = project;
        const { changedTasks, changedSteps } = cancelTasks(tasks, project);
        const projectStatus = getProjectNewStatus(changedTasks, status)
        await notifyVendors(changedSteps);
        return await updateProject({"_id": id}, { status: projectStatus, tasks: changedTasks, steps: changedSteps});
    } catch(err) {
        console.log(err);
        console.log("Error in updateProjectStatus");
    }
}

function getProjectNewStatus(changedTasks, status) {
    const notFullyCancelledTask = changedTasks.find(item => {
        return item.status === "Cancelled Halfway" || 
            item.status === "Ready for Delivery" || 
            item.status === "Delivered"
    })
    return notFullyCancelledTask ? "Cancelled Halfway" : status;
}

function setStepsStatus({steps, status, project}) {
    const projectSteps = [...project.steps];
    const stepIdentify = steps.map(item => {
        return item.taskId + item.name;
    })
    return updateStepsStatuses({steps: projectSteps, status, stepIdentify})
}

module.exports = { changeProjectProp, cancelTasks, cancelSteps, updateProjectStatus, setStepsStatus };