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
    // const changedTasks = cancelledStatuses(tasksIds, projectTasks);
    // const changedSteps = cancelledStatuses(tasksIds, projectSteps);
    return { changedTasks, changedSteps };
}

function cancellCheckedTasks(tasksIds, projectTasks, changedSteps) {
    return projectTasks.map(task => {
        if(tasksIds.indexOf(task.taskId) !== -1) {
            task.status = getTaskNewStatus(changedSteps, task.taskId);
        }
        return task;
    })
} 

function getTaskNewStatus(steps, taskId) {
    const taskSteps = steps.filter(item => item.taskId === taskId)
        .map(step => step.status);
    const cancelledSteps = taskSteps.filter(item => item === "Cancelled");
    const halfCancelledSteps = taskSteps.filter(item => item === "Cancelled Halfway");
    if(halfCancelledSteps.length) {
        return "Cancelled Halfway"
    }
    if(cancelledSteps.length === taskSteps.length) {
        return "Cancelled"
    }
    return "Ready for Delivery";
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
    const updated = arr.map(item => {
        if(!checkStepsStatuses({changedSteps, task: item, status: "Cancelled"})) {
            item.status = "Cancelled";
            return item;
        }
    })
    return updated;
}

function checkStepsStatuses({changedSteps, task, status}) {
    for(let step of changedSteps) {
        if(step.taskId === task.taskId && step.status !== status) {
            return true;
        }
    }
    return false;
}

function cancelledStatuses(tasksIds, arr) {
    const updated = arr.map(item => {
        if(tasksIds.indexOf(item.taskId) !== -1) {
            item.status = "Cancelled";
            return item; 
        }
        return item;
    })
    return updated;
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
            item.status = +item.progress.wordsDone > 0 ? "Cancelled Halfway" : status;
            return item;
        }
        return item;
    })
    return updated;
}

async function updateProjectStatus(id, status) {
    try {
        if(status !== "Cancelled") {
            return await updateProject({"_id": id}, { status });
        }
        const project = await getProject({"_id": id});
        const { tasks } = project;
        const { changedTasks, changedSteps } = cancelTasks(tasks, project);
        await notifyVendors(changedSteps);
        return await updateProject({"_id": id}, { status, tasks: changedTasks, steps: changedSteps});
    } catch(err) {
        console.log(err);
        console.log("Error in updateProjectStatus");
    }
}

function setStepsStatus({steps, status, project}) {
    const projectSteps = [...project.steps];
    const stepIdentify = steps.map(item => {
        return item.taskId + item.name;
    })
    return updateStepsStatuses({steps: projectSteps, status, stepIdentify})
}

module.exports = { changeProjectProp, cancelTasks, cancelSteps, updateProjectStatus, setStepsStatus };