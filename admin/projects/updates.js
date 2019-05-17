const { Projects } = require('../models');
const { getProject, updateProject } = require('./getProjects');
const { notifyVendors } = require('./emails');
const { getTaskProgress } = require('../services');

async function changeProjectProp(projectId, property) {
    const project = await getProject({"_id": projectId});
    let changedProject = {...project._doc};
    changedProject[property] = !changedProject[property]; 
    return await updateProject({"_id": projectId}, {...changedProject});
}

async function updateProjectProgress(project) {
    let { steps, tasks } = project;
    try {
        for(let task of tasks) {
            const { progress } = await getTaskProgress(task);
            steps = updateStepsProgress({task, steps, progress});
            task.status = areAllStepsCompleted(steps, task.taskId) && task.status === "Started" ? "Pending Approval" : task.status;
        }
        return await updateProject({"_id": project.id}, { steps, tasks });
    } catch(err) {
        console.log(err);
        console.log("Error in updateProjectProgress");
    }
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
            task.status = getTaskNewStatus(changedSteps, task.taskId) || task.status;
            if(task.status === "Cancelled Halfway") {
                task.finance = getTaskNewFinance(changedSteps, task);
            }
        }
        return task;
    })
}

function getTaskNewFinance(changedSteps, task) {
    const  { priceValues } = updateTaskNewFinance(changedSteps, task);
    const { finance } = task;
    const Price = {...finance.Price, halfReceivables: priceValues.receivables, halfPayables: priceValues.payables};
    const updatedFinance = {...finance, Price};
    return updatedFinance;
}

function updateTaskNewFinance(changedSteps, task) {
    let priceValues = {receivables: 0, payables: 0};
    const taskSteps = changedSteps.filter(item => item.taskId === task.taskId);
    for(let step of taskSteps) {
        if(step.status === "Cancelled Halfway") {
            priceValues.receivables+= +step.finance.Price.halfReceivables;
            priceValues.payables+= +step.finance.Price.halfPayables;
        } else {
            priceValues.receivables+= +step.finance.Price.receivables;
            priceValues.payables+= +step.finance.Price.payables;
        }
    }
    return { priceValues };
}

function getTaskNewStatus(steps, taskId) {
    const taskSteps = steps.filter(item => item.taskId === taskId)
        .map(step => step.status);
    const cancelledSteps = taskSteps.filter(item => item === "Cancelled");
    const completedSteps = taskSteps.filter(item => item === "Completed");
    const halfCancelledSteps = taskSteps.filter(item => item === "Cancelled Halfway");
    if(completedSteps.length === taskSteps.length) {
        return "Pending Approval"
    }
    if(halfCancelledSteps.length) {
        return "Cancelled Halfway"
    }
    if(cancelledSteps.length === taskSteps.length) {
        return "Cancelled"
    }
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
            if(status === "Ready to Start" && item.name !== "translate1") {
                newStatus = "Waiting to Start";
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
        const project = await getProject({"_id": id});
        if(status !== "Cancelled") {
            return await setNewProjectDetails(project, status);
        }
        const { tasks } = project;
        const { changedTasks, changedSteps } = cancelTasks(tasks, project);
        const projectStatus = getProjectNewStatus(changedTasks, status);
        const Price = getUpdatedProjectFinance(changedTasks);
        await notifyVendors(changedSteps);
        return await updateProject({"_id": id}, { status: projectStatus, finance: {...project.finance, Price}, tasks: changedTasks, steps: changedSteps});
    } catch(err) {
        console.log(err);
        console.log("Error in updateProjectStatus");
    }
}

async function setNewProjectDetails(project, status) {
    try {
        if(status === "Started" || status === "Approved") {
            return await updateWithAcceptedSteps(project, status);
        }
        return await updateProject({"_id": id}, { status })
    } catch(err) {
        console.log(err);
        console.log("Error in setNewProjectDetails");
    }
}

async function updateWithAcceptedSteps(project, status) {
    let { steps } = project;
    for(let step of steps) {
        if(step.status === 'Accepted') {
            step.status = step.name === 'translate1' ? 'Ready to Start' : 'Waiting to Start';
        }
    }
    try {
        return await updateProject({"_id": project.id},{status, steps});
    } catch(err) {
        console.log(err);
        console.log("Error in updateWithAcceptedSteps");
    }
}

function getUpdatedProjectFinance(tasks) {
    let receivables = 0;
    let payables = 0;
    for(let task of tasks) {
        receivables += task.status === "Cancelled Halfway" ? +task.finance.Price.halfReceivables : +task.finance.Price.receivables;
        payables += task.status === "Cancelled Halfway" ? +task.finance.Price.halfPayables : +task.finance.Price.payables;
    }
    return { receivables: +receivables.toFixed(2), payables: +payables.toFixed(2) };
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

function updateStepsProgress({steps, task, progress}) {
    const updatedSteps = steps.map(item => {
        if(task.taskId === item.taskId) {
            item.progress = setStepsProgress(item, progress);
            return item
        }
        return item;
    });
    return updatedSteps;
}

function setStepsProgress(step, progress) {
    const { jobsMetrics } = progress;
    let stepProgress = progress[step.name];
    for(let metrics of jobsMetrics) {
        const { jobId, metricsProgress } = metrics;
        const { wordsDone, wordsToBeDone, totalWordCount } = metricsProgress[step.name];
        stepProgress[jobId] = { wordsDone, wordsToBeDone, totalWordCount };
    }
    return stepProgress;
}

function areAllStepsCompleted(steps, taskId) {
    const nonCompleted = steps.filter(step => step.taskId === taskId && step.status !== "Completed");
    return !nonCompleted.length;
}

async function updateTaskTargetFiles({step, jobId, path}) {
    try {
        const project = await Projects.findOne({"steps._id": step._id});
        const tasks = project.tasks.map(task => {
            if(task.taskId === step.taskId) {
                task.xtmJobs = getAfterPathUpdate({
                    xtmJobs:task.xtmJobs, jobId, path, name: step.name});
            }
            return task;
        })
        return await updateProject({"_id": project.id}, { tasks });
    } catch(err) {
        console.log(err);
        console.log("Error in updateTaskTargetFiles");
    }
}

function getAfterPathUpdate({xtmJobs, jobId, path, name}) {
    return xtmJobs.map(item => {
        if(item.jobId === jobId) {
            item[`${name}-targetFile`] = path;
            item.targetFile = path;
        }
        return item;
    })
}

async function getAfterApproveFile({taskId, jobId, isFileApproved}) {
    try {
        const project = await getProject({"tasks.taskId": taskId});
        const tasks = project.tasks.map(task => {
            if(task.taskId === taskId) {
                task.xtmJobs = getAfterApproveUpdate({jobs: task.xtmJobs, jobId, isFileApproved});
            }
            return task;
        });
        return updateProject({"_id": project.id}, { tasks });
    } catch(err) {
        console.log(err);
        console.log("Error in getAfterApproveFile");
    }
}

function getAfterApproveUpdate({jobs, jobId, isFileApproved}) {
    return jobs.map(item => {
        if(item.jobId === jobId) {
            item.isFileApproved = isFileApproved;
        }
        return item;
    })
}

module.exports = { changeProjectProp, cancelTasks, updateProjectStatus, setStepsStatus, updateStepsProgress, 
    areAllStepsCompleted, updateTaskTargetFiles, getAfterApproveFile, updateProjectProgress };