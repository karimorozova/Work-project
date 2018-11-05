const { Projects } = require('../models');
const { getProject, updateProject } = require('./getProjects');

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
    const changedTasks = cancelledStatuses(tasksIds, projectTasks);
    const changedSteps = cancelledStatuses(tasksIds, projectSteps);
    return { changedTasks, changedSteps }
}

function cancelSteps(checkedSteps, project) {
    const projectSteps = [...project.steps];
    const projectTasks = [...project.tasks];
    const stepIdentify = checkedSteps.map(item => {
        return item.taskId + item.name;
    })
    const changedSteps = cancelledSteps(stepIdentify, projectSteps);
    const changedTasks = cancelledTasks(changedSteps, projectTasks);
    return { changedSteps, changedTasks };
}

function cancelledTasks(changedSteps, arr) {
    const updated = arr.map(item => {
        if(!checkForNotCancelledSteps(changedSteps, item)) {
            item.status = "Cancelled";
            return item;
        }
        return item;
    })
    return updated;
}

function checkForNotCancelledSteps(changedSteps, task) {
    let isNotCancelledExist = false;
    for(let step of changedSteps) {
        if(step.taskId === task.taskId && step.status !== "Cancelled") {
            isNotCancelledExist = true;
        }
    }
    return isNotCancelledExist;
}

function cancelledSteps(stepIdentify, arr) {
    const updated = arr.map(item => {
        if(stepIdentify.indexOf(item.taskId + item.name) !== -1) {
            item.status = "Cancelled";
            return item;
        }
        return item;
    })
    return updated;
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

module.exports = { changeProjectProp, cancelTasks, cancelSteps };