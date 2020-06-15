const { Projects, User, MemoqProject } = require('../models');
const { getProject, updateProject } = require('./getProjects');
const { stepCancelNotifyVendor, notifyVendorStepStart } = require('./emails');
const { notifyManagerProjectStarts } = require('../utils');
const { pmMail } = require('../utils/mailtopm');
const { getUpdatedProjectFinance } = require('./porjectFinance');
const { setMemoqTranlsators, getProjectTranslationDocs } = require('../services/memoqs/projects');
const { downloadMemoqFile } = require('../services/memoqs/files');

async function updateProjectProgress(project, isCatTool) {
    let { steps, tasks } = project;
    try {
        for(let task of tasks) {
          const units = JSON.parse(task.service.calculationUnit);
          for (let { unit } of units) {
            if (unit === 'CAT Wordcount' && isCatTool) {
              const docs = await getProjectTranslationDocs(task.memoqProjectId);
              task.memoqDocs = Array.isArray(docs) ? docs.filter(item => item.TargetLangCode === task.memoqTarget) : [docs];
              steps = updateWordcountStepsProgress({ steps, task });
            } else if (!isCatTool) {
              steps = updateStepsProgress(task, steps);
            }
          }
        }
        return await updateProject({"_id": project.id}, { steps, tasks });
    } catch(err) {
        console.log(err);
        console.log("Error in updateProjectProgress");
    }
}

async function getProjectAfterCancelTasks(tasks, project) {
    try {
        const { changedTasks, changedSteps, stepIdentify } = await cancelTasks(tasks, project);
        const Price = getUpdatedProjectFinance(changedTasks);
        const notifySteps = stepIdentify.length ? changedSteps.filter(item => stepIdentify.indexOf(item.stepId) !== -1) : changedSteps;
        await stepCancelNotifyVendor(notifySteps);
        return await updateProject({"_id": project.id},
            {tasks: changedTasks, steps: changedSteps, finance: {...project.finance, Price}});
    } catch(err) {
        console.log(err);
        console.log("Error in getProjectAfterCancelTasks");
        throw new Error(err.message);
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
    try {
    const changedTasks = await cancelCheckedTasks({
            tasksIds, projectTasks, projectId: project.id, changedSteps
        });
    return { changedTasks, changedSteps, stepIdentify };
    } catch(err) {
        console.log(err);
        console.log("Error in getProjectAfterCancelTasks");
        throw new Error(err.message);
    }
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

async function cancelCheckedTasks({tasksIds, projectTasks, changedSteps, projectId}) {
    const unchangingStatuses = ['Ready for Delivery', 'Pending Approval [DR1]', 'Pending Approval [DR2]', 'Delivered'];
    let tasks = [...projectTasks];
    try {
        for(let task of tasks) {
            if(tasksIds.indexOf(task.taskId) !== -1 && unchangingStatuses.indexOf(task.status) === -1) {
                task.status = getTaskStatusAfterCancel(changedSteps, task.taskId) || task.status;
                if(task.status === "Cancelled Halfway") {
                    task.finance = getTaskNewFinance(changedSteps, task);
                    task.targetFiles = await getTaskTarfgetFiles({task, projectId, stepName: 'halfway'});
                }
            }
        }
        return tasks;
    } catch(err) {
        console.log(err);
        console.log("Error in cancelCheckedTasks");
        throw new Error(err.message);
    }
}

async function getTaskTarfgetFiles({task, projectId, stepName}) {
    let targetFiles = [];
    const { memoqDocs, memoqProjectId } = task;
    try {
        for(let doc of memoqDocs) {
            const exportPath = doc.ExportPath.slice(1);
            const pathParts = exportPath.split(".");
            const fileName = pathParts.slice(0, -1).join();
            const path = `/projectFiles/${projectId}/${stepName}_${fileName}.rtf`;
            await downloadMemoqFile({memoqProjectId, docId: doc.DocumentGuid, path: `./dist${path}`});
            targetFiles.push({fileName: doc.DocumentName, path});
        }
        return targetFiles;
    } catch(err) {
        console.log(err);
        console.log("Error in getTaskTarfgetFiles");
        throw new Error(err.message);
    }
}

async function downloadCompletedFiles(stepId) {
    try {
        let { id, steps, tasks } = await getProject({"steps._id": stepId});
        const step = steps.find(item => item.id === stepId);
        const taskIndex = tasks.findIndex(item => item.taskId === step.taskId);
        tasks[taskIndex].targetFiles = await getTaskTarfgetFiles({task: tasks[taskIndex], projectId: id, stepName: step.name});
        await Projects.updateOne({"_id": id}, { tasks });
    } catch(err) {
        console.log(err);
        console.log("Error in downloadCompletedFiles");
        throw new Error(err.message);
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
        return "Pending Approval [DR1]"
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
    const sameSteps = projectSteps.filter(item => {
        return item.taskId === stepTask.taskId
                && item.stepId !== step.stepId
                && item.status !== "Completed"
    });
    const stage1 = stepTask.service.steps.find(item => item.stage === 'stage1');
    return sameSteps.length && stage1.step.title !== step.serviceStep.title;
}

function getStepNewFinance(step) {
    const { progress, finance } = step;
    const { Wordcount, Price } = finance;
    const done = progress.wordsDone/progress.totalWordCount;
    Wordcount.payables = progress.wordsDone;
    Price.halfReceivables = +((Price.receivables*done).toFixed(2));
    Price.halfPayables = +((Price.payables*done).toFixed(2));
    return { Wordcount, Price }
}

async function updateProjectStatus(id, status, reason) {
    try {
        const project = await getProject({"_id": id});
        if(status !== "Cancelled") {
            return await setNewProjectDetails(project, status, reason);
        }
        const { tasks, steps } = project;
        const notifySteps = steps.length ? steps.map(item => { return {...item._doc}}) : [];
        const { changedTasks, changedSteps } = await cancelTasks(tasks, project);
        const projectStatus = getProjectNewStatus(changedTasks, status);
        const Price = getUpdatedProjectFinance(changedTasks);
        if(notifySteps.length) {
            await stepCancelNotifyVendor(notifySteps);
        }
        return await updateProject(
                {"_id": id},
                { status: projectStatus, reason: reason, isPriceUpdated: false, finance: {...project.finance, Price}, tasks: changedTasks, steps: changedSteps}
            );
    } catch(err) {
        console.log(err);
        console.log("Error in updateProjectStatus");
        throw new Error(err.message);
    }
}

async function setNewProjectDetails(project, status, reason) {
    try {
        if(status === "Started" || status === "Approved") {
            return await getApprovedProject(project, status);
        }
        if(status === "Rejected") {
            const client = {...project.customer._doc, id: project.customer.id};
            const user = await User.findOne({"_id": client.projectManager._id});
            await pmMail(project, client, user);
        }
        return await updateProject({"_id": project.id}, { status, isPriceUpdated: false, reason: reason});
    } catch(err) {
        console.log(err);
        console.log("Error in setNewProjectDetails");
        throw new Error(err.message);
    }
}

async function getApprovedProject(project, status) {
    const taskIds = project.tasks.map(item => item.taskId);
    const { tasks, steps } = updateWithApprovedTasks({taskIds, project});
    const stepsStatuses = ["Ready to Start", "Waiting to Start"];
    const wordsUnitSteps = steps.filter(item => item.serviceStep.calculationUnit === 'Words' && stepsStatuses.indexOf(item.status) !== -1);
    const splittedByIdSteps = wordsUnitSteps.reduce((acc, cur) => {
        acc[cur.memoqProjectId] = acc[cur.memoqProjectId] ? [...acc[cur.memoqProjectId], cur] : [cur];
        return acc;
    }, {})
    try {
        if(wordsUnitSteps.length) {
            for(let id in splittedByIdSteps) {
                await setMemoqTranlsators(id, splittedByIdSteps[id]);
            }
        }
        if(project.isStartAccepted) {
            await notifyManagerProjectStarts(project);
        }
        await notifyVendorStepStart([], steps, project);
        return await updateProject({"_id": project.id},{status, tasks, steps, isPriceUpdated: false});
    } catch(err) {
        console.log(err);
        console.log("Error in getApprovedProject");
        throw new Error(err.message);
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

function updateWordcountStepsProgress({steps, task}) {
    const { memoqDocs: docs } = task;
    return steps.map(item => {
        if(task.taskId === item.taskId) {
            item.progress = item.status === 'Started' ? setStepsProgress(item.serviceStep.symbol, docs) : item.progress;
        }
        return item;
    });
}

function setStepsProgress(symbol, docs) {
    const prop = symbol === 'translation' ? 'ConfirmedWordCount' : 'Reviewer1ConfirmedWordCount';
    const totalProgress = docs.reduce((acc, cur) => {
        acc.wordsDone = acc.wordsDone ? acc.wordsDone + +cur[prop] : +cur[prop];
        acc.totalWordCount = acc.totalWordCount ? acc.totalWordCount + +cur.TotalWordCount : +cur.TotalWordCount;
        return acc;
    }, {});
    let stepProgress = {};
    for(let doc of docs) {
        stepProgress[doc.DocumentGuid] = { wordsDone: +doc[prop], totalWordCount: +doc.TotalWordCount, fileName: doc.DocumentName };
    }
    return {...stepProgress, ...totalProgress};
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
        throw new Error(err.message);
    }
}

async function getAfterReopenSteps(steps, project) {
    try {
        const updatedSteps = setStepsStatus({steps, status: 'Started', project});
        const stepIdentify = steps.map(item => item.taskId+item.name);
        const chosenSteps = updatedSteps.filter(item => stepIdentify.indexOf(item.taskId+item.name) !== -1);
        const updatedtasks = getTasksAfterReopen({steps: chosenSteps, tasks: project.tasks});
        return await updateProject({"_id": project.id}, { tasks: updatedtasks, steps: updatedSteps, status: "In progress" });
    } catch(err) {
        console.log(err);
        console.log("Error in getAfterReopenSteps");
        throw new Error(err.message);
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
async function updateOtherProject(query, update) {
   return await MemoqProject.findOneAndUpdate(query, update, {new: false})
}

module.exports = { getProjectAfterCancelTasks, updateProjectStatus, setStepsStatus, downloadCompletedFiles,
    updateProjectProgress, updateWithApprovedTasks, getAfterReopenSteps, updateNonWordsTaskTargetFiles, updateOtherProject };
