const { notifyDeliverablesDownloaded } = require('../projects/emails');
const { updateProject } = require('../projects/getProjects');
const { updateWithApprovedTasks } = require('../projects/updates');
const { setTasksDeliveryStatus } = require("../delivery/approve");

async function getAfterTaskStatusUpdate({task, project, status}) {
    let updatedProject = {};
    try {
        if(status === 'Delivered') {
            updatedProject = await setTasksDeliveryStatus({taskIds: [task.taskId], project, status});    
            await notifyDeliverablesDownloaded(task.taskId, project);
        }
        if(status === 'Approved') {
            updatedProject = await getWithApprovedTasks({taskIds: [task.taskId], project, status});
        }
        if(status === 'Rejected') {
            updatedProject = await getWithRejectedTasks({taskIds: [task.taskId], project});
        }
        return updatedProject;
    } catch(err) {
        console.log(err);
        console.log("Error in getAfterTaskStatusUpdate");
    }
}

async function getWithApprovedTasks({taskIds, project}) {
    try {
        const { tasks, steps } = updateWithApprovedTasks({taskIds, project});
        return await updateProject({"_id": project.id},{tasks, steps});
    } catch(err) {
        console.log(err);
        console.log("Error in getWithApprovedTasks");
    }
}

async function getWithRejectedTasks({taskIds, project}) {
    const tasks = project.tasks.map(task => {
        if(taskIds.indexOf(task.taskId) !== -1) {
            task.status = 'Rejected'
        }
        return task;
    })
    try {
        return await updateProject({"_id": project.id},{ tasks });
    } catch(err) {
        console.log(err);
        console.log("Error in getWithRejectedTasks");
    }
}

module.exports = { getAfterTaskStatusUpdate };
