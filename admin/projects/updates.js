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
    const changedTasks = cancelledStatuses(tasksIds, projectTasks);
    const changedSteps = cancelledStatuses(tasksIds, projectSteps);
    const checkedSteps = project.steps.filter(item => tasksIds.indexOf(item.taskId) !== -1);
    return { changedTasks, changedSteps, checkedSteps };
}

function cancelSteps(checkedSteps, project) {
    const projectSteps = [...project.steps];
    const projectTasks = [...project.tasks];
    const stepIdentify = checkedSteps.map(item => {
        return item.taskId + item.name;
    })
    const changedSteps = updateStepsStatuses({stepIdentify, steps:projectSteps, status: "Cancelled"});
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

function updateStepsStatuses({steps, status, stepIdentify}) {
    const updated = steps.map(item => {
        if(stepIdentify.indexOf(item.taskId + item.name) !== -1) {
            item.status = status;
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