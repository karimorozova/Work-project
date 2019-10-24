const { Projects, User } = require('../models');
const { getProject, updateProject } = require('./getProjects');
const { stepCancelNotifyVendor } = require('./emails');
const { getTaskProgress } = require('../services');
const { notifyManagerProjectStarts, pmMail } = require('../utils');
const { generateTargetFile } = require('../services/xtmApi');
const { storeTargetFile } = require('./files');
const { getUpdatedProjectFinance } = require('./porjectFinance');

async function toggleProjectProp(projectId, property) {
    const project = await getProject({"_id": projectId});
    let changedProject = {...project._doc};
    changedProject[property] = !changedProject[property]; 
    return await updateProject({"_id": projectId}, {...changedProject});
}

async function updateProjectProgress(project, isCatTool) {
    let { steps, tasks } = project;
    try {
        for(let task of tasks) {
            if(task.service.calculationUnit === 'Words' && isCatTool) {
                const { progress } = await getTaskProgress(task);
                steps = updateWordcountStepsProgress({task, steps, progress});
            } else if(!isCatTool) {
                steps = updateStepsProgress(task, steps);
            }
            task.status = areAllStepsCompleted(steps, task.taskId) && task.status === "Started" ? "Pending Approval" : task.status;
        }
        return await updateProject({"_id": project.id}, { steps, tasks });
    } catch(err) {
        console.log(err);
        console.log("Error in updateProjectProgress");
    }
}

async function getProjectAfterCancelTasks(tasks, project) {
    try {
        const { changedTasks, changedSteps, inCompletedSteps } = await cancelTasks(tasks, project);
        const Price = getUpdatedProjectFinance(changedTasks);
        await stepCancelNotifyVendor(inCompletedSteps, project.projectId);
        return await updateProject({"_id": project.id}, 
            {tasks: changedTasks, steps: changedSteps, finance: {...project.finance, Price}});
    } catch(err) {
        console.log(err);
        console.log("Error in getProjectAfterCancelTasks")
    }
}

async function cancelTasks(tasks, project) {
    let projectTasks = [...project.tasks];
    let projectSteps = [...project.steps];
    const tasksIds = tasks.map(item => item.taskId);
    let inCompletedSteps = [];
    if(projectSteps.length) {
        inCompletedSteps = projectSteps.map(item => {
            if(item.status !== "Completed" && tasksIds.indexOf(item.taskId) !== -1) {
                return {...item._doc};
            }
        }).filter(item => !!item);
    }
    const stepIdentify = inCompletedSteps.length ? inCompletedSteps.map(step => step.stepId): [];
    const changedSteps = stepIdentify.length ? cancelSteps({stepIdentify, steps: projectSteps}) : [];
    const changedTasks = await cancellCheckedTasks({tasksIds, projectTasks, changedSteps, projectId: project.id});
    return { changedTasks, changedSteps, inCompletedSteps };
}

function cancelSteps({stepIdentify, steps}) {
    const updated = steps.map(item => {
        if(stepIdentify.indexOf(item.stepId) !== -1) {
            let newStatus = item.status !== 'Completed' ? "Cancelled" : item.status;
            if(+item.progress.wordsDone > 0 && newStatus !== 'Completed') {
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

async function cancellCheckedTasks({tasksIds, projectTasks, changedSteps, projectId}) {
    const unchangingStatuses = ['Ready for Delivery', 'Pending Approval', 'Delivered'];
    let tasks = [...projectTasks];
    for(let task of tasks) {
        if(tasksIds.indexOf(task.taskId) !== -1 && unchangingStatuses.indexOf(task.status) === -1) {
            task.status = getTaskStatusAfterCancel(changedSteps, task.taskId) || task.status;
            if(task.status === "Cancelled Halfway") {
                task.finance = getTaskNewFinance(changedSteps, task);
                task.xtmjobs = await updateXtmJobs({task, projectId, changedSteps});
            }
        }
    }
    return tasks;
}

async function updateXtmJobs({task, projectId, changedSteps}) {
    const { xtmJobs } = task;
    const step = changedSteps.find(item => item.taskId === task.taskId && item.status !== 'Cancelled');
    try {
        let updatedXtmJobs = [];
        for(let job of xtmJobs) {
            let generatedFiles = await generateTargetFile({projectId: task.projectId, jobId: job.jobId});
            const { path } = await storeTargetFile({step, id: projectId, projectId: task.projectId, file: {...generatedFiles[0], fileName: job.fileName}});
            updatedXtmJobs = getAfterPathUpdate({xtmJobs, jobId: job.jobId, path, name: step.name});
        }
        return updatedXtmJobs;
    } catch(err) {
        console.log(err);
        console.log("Error in updateXtmJobs");
    }
}

function getTaskNewFinance(changedSteps, task) {
    const  { priceValues } = updateTaskNewFinance(changedSteps, task);
    const { finance } = task;
    const Price = {...finance.Price, halfReceivables: +(priceValues.receivables.toFixed(2)), halfPayables: +(priceValues.payables.toFixed(2))};
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
        } else if(step.status === "Completed") {
            priceValues.receivables+= +step.finance.Price.receivables;
            priceValues.payables+= +step.finance.Price.payables;
        }
    }
    return { priceValues };
}

function getTaskStatusAfterCancel(steps, taskId) {
    const taskSteps = steps.filter(item => item.taskId === taskId).map(step => step.status);
    const cancelledSteps = taskSteps.filter(item => item === "Cancelled");
    const completedSteps = taskSteps.filter(item => item === "Completed");
    const halfCancelledSteps = taskSteps.filter(item => item === "Cancelled Halfway");
    if(cancelledSteps.length === taskSteps.length || !steps.length) {
        return "Cancelled"
    }
    if(completedSteps.length === taskSteps.length) {
        return "Pending Approval"
    }
    if(halfCancelledSteps.length || (completedSteps.length && completedSteps.length < taskSteps.length)) {
        return "Cancelled Halfway"
    }
}

function updateStepsStatuses({projectSteps, tasks, status, stepIdentify}) {
    return projectSteps.map(item => {
        if(stepIdentify.indexOf(item.id) !== -1) {
            let newStatus = status;
            if(status === "Ready to Start" && isPrevStep({tasks, projectSteps, step: item})) {
                newStatus = "Waiting to Start";
            }
            item.status = newStatus;
        }
        return item;
    })
}

function isPrevStep({tasks, projectSteps, step}) {
    const stepTask = tasks.find(item => item.taskId === step.taskId);
    const sameSteps = projectSteps.filter(item => item.taskId === stepTask.taskId && item.stepId !== step.stepId);
    const stage1 = stepTask.service.steps.find(item => item.stage === 'stage1');
    return sameSteps.length && stage1.step.title !== step.serviceStep.title;
}

function getStepNewFinance(step) {
    const { progress, finance } = step;
    const { Wordcount, Price } = finance;
    const done = progress.wordsDone/progress.wordsTotal;
    Wordcount.payables = progress.wordsDone;
    Price.halfReceivables = +((Price.receivables*done).toFixed(2));
    Price.halfPayables = +((Price.payables*done).toFixed(2));
    return { Wordcount, Price }
}

async function updateProjectStatus(id, status) {
    try {
        const project = await getProject({"_id": id});
        if(status !== "Cancelled") {
            return await setNewProjectDetails(project, status);
        }
        const { tasks, steps } = project;
        const notifySteps = steps.length ? steps.map(item => { return {...item._doc}}) : [];
        const { changedTasks, changedSteps } = await cancelTasks(tasks, project);
        const projectStatus = getProjectNewStatus(changedTasks, status);
        const Price = getUpdatedProjectFinance(changedTasks);
        if(notifySteps.length) {
            await stepCancelNotifyVendor(notifySteps, project.projectId);
        }
        return await updateProject({"_id": id}, { status: projectStatus, finance: {...project.finance, Price}, tasks: changedTasks, steps: changedSteps});
    } catch(err) {
        console.log(err);
        console.log("Error in updateProjectStatus");
    }
}

async function setNewProjectDetails(project, status) {
    try {
        if(status === "Started" || status === "Approved") {
            return await getApprovedProject(project, status);
        }
        if(status === "Rejected") {
            const client = {...project.customer._doc, id: project.customer.id};
            const user = await User.findOne({"_id": client.projectManager._id});
            await pmMail(project, client, user);
        }
        return await updateProject({"_id": project.id}, { status })
    } catch(err) {
        console.log(err);
        console.log("Error in setNewProjectDetails");
    }
}

async function getApprovedProject(project, status) {
    const taskIds = project.tasks.map(item => item.taskId);
    const { tasks, steps } = updateWithApprovedTasks({taskIds, project});
    try {
        if(project.isStartAccepted) {
            await notifyManagerProjectStarts(project);
        }
        return await updateProject({"_id": project.id},{status, tasks, steps});
    } catch(err) {
        console.log(err);
        console.log("Error in getApprovedProject");
    }
}

function updateWithApprovedTasks({taskIds, project}) {
    const tasks = project.tasks.map(task => {
        if(task.status === 'Created' && taskIds.indexOf(task.taskId) !== -1) {
            task.status = 'Approved'
        }
        return task;
    })
    const steps = project.steps.map(step => {
        if(step.status === 'Accepted' && taskIds.indexOf(step.taskId) !== -1) {
            const stepTask = tasks.find(item => item.taskId === step.taskId);
            step.status = getApprovedStepStatus(stepTask, step);
        }
        return step;
    })
    return { tasks, steps }
}

function getApprovedStepStatus(stepTask, step) {
    const stage1 = stepTask.service.steps.find(item => item.stage === 'stage1');
    if(stage1.step.title === step.serviceStep.title) {
        return 'Ready to Start';
    }
    return 'Waiting to Start';
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
    const {steps: projectSteps, tasks } = project;
    const stepIdentify = steps.map(item => item._id);
    return updateStepsStatuses({projectSteps, tasks, status, stepIdentify})
}

function updateStepsProgress(task, steps) {
    return steps.map(item => {
        if(task.taskId === item.taskId) {
            item.progress = item.status  === 'Started' && item.targetFile ? 100 : item.progress;
        }
        return item;
    })
}

function updateWordcountStepsProgress({steps, task, progress}) {
    return steps.map(item => {
        if(task.taskId === item.taskId) {
            item.progress = item.status === 'Started' ? setStepsProgress(item, progress) : item.progress;
        }
        return item;
    });
}

function setStepsProgress(step, progress) {
    const { jobsMetrics } = progress;
    let stepProgress = progress[step.catName];
    for(let metrics of jobsMetrics) {
        const { jobId, metricsProgress } = metrics;
        const { wordsDone, wordsToBeDone, totalWordCount } = metricsProgress[step.catName];
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
        const tasks = getTasksWithTargets({tasks: project.tasks, step, jobId, path});
        return await updateProject({"_id": project.id}, { tasks });
    } catch(err) {
        console.log(err);
        console.log("Error in updateTaskTargetFiles");
    }
}

function getTasksWithTargets({tasks, step, jobId, path}) {
    return tasks.map(task => {
        if(task.taskId === step.taskId) {
            task.xtmJobs = getAfterPathUpdate({
                xtmJobs: task.xtmJobs, jobId, path, name: step.name});
        }
        return task;
    })
}

async function updateNonWordsTaskTargetFiles({project, jobId, path, fileName}) {
    const steps = project.steps.map(item => {
        if(item.id === jobId) {
            item.status = 'Completed';
            item.progress = 100;
            item.targetFile = path;
        }
        return item;
    })
    const taskStep = steps.find(item => item.id === jobId);
    const tasks = project.tasks.map(item => {
        let targetFiles = item.targetFiles || [];
        if(taskStep.taskId === item.taskId) {
            targetFiles.push({fileName, path, isFileApproved: false});
            item.targetFiles = targetFiles;
        }
        return item;
    })
    try {
        return await updateProject({"_id": project.id}, { steps, tasks });
    } catch(err) {
        console.log(err);
        console.log("Error in updateNonWordsTaskTargetFiles");
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

async function getAfterApproveFile({taskId, jobId, isFileApproved, path}) {
    try {
        const project = await getProject({"tasks.taskId": taskId});
        const tasks = project.tasks.map(task => {
            if(task.taskId === taskId) {
                if(task.xtmJobs) {
                    task.xtmJobs = getAfterApproveUpdate({jobs: task.xtmJobs, jobId, isFileApproved});
                } else {
                    task.targetFiles = task.targetFiles.map(item => {
                        item.isFileApproved = item.path === `./dist${path}`;
                        return item;
                    })
                }
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

async function getAfterReopenSteps(steps, project) {
    try {
        const updatedSteps = setStepsStatus({steps, status: 'Started', project});
        const stepIdentify = steps.map(item => item.taskId+item.name);
        const chosenSteps = updatedSteps.filter(item => stepIdentify.indexOf(item.taskId+item.name) !== -1);
        const updatedtasks = getTasksAfterReopen({steps: chosenSteps, tasks: project.tasks});
        return await updateProject({"_id": project.id}, { tasks: updatedtasks, steps: updatedSteps, status: "In progress" });
    } catch(err) {

    }
}

function getTasksAfterReopen({steps, tasks}) {
    let updatedTasks = [...tasks];
    for(let step of steps) {
        if(step.status === 'Started') {
            let taskIndex = updatedTasks.findIndex(item => item.taskId === step.taskId);
            updatedTasks[taskIndex].status = "Started";
        }
    }
    return updatedTasks;
}

module.exports = { toggleProjectProp, getProjectAfterCancelTasks, updateProjectStatus, setStepsStatus, updateTaskTargetFiles, 
    getAfterApproveFile, updateProjectProgress, updateWithApprovedTasks, getTasksWithTargets, getAfterReopenSteps, updateNonWordsTaskTargetFiles };