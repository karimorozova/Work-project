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

function cancelledStatuses(tasksIds, projectTasks) {
    const updated = projectTasks.map(item => {
        if(tasksIds.indexOf(item.taskId) !== -1) {
            item.status = "Cancelled";
            return item; 
        }
        return item;
    })
    return updated;
}

module.exports = { changeProjectProp, cancelTasks };