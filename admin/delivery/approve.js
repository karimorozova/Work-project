const { getProject, updateProject, notifyClientTaskReady, sendClientDeliveries } = require('../projects');

async function getProjectAfterApprove({taskIds, project, isDeliver}) {
    try {
        if(isDeliver) {
            await sendClientDeliveries({taskIds, project});
            return await getProjectAfterTasksUpdated({taskIds, project, status: "Delivered"})
        }
        await notifyClientTaskReady({taskIds, project});
        return await getProjectAfterTasksUpdated({taskIds, project, status: "Ready for Delivery"});
    } catch(err) {
        console.log(err);
        console.log("Error in getProjectAfterApprove");
    }
}

async function getProjectAfterTasksUpdated({taskIds, project, status}) {
    const updatedTasks = getUpdatedTasks({taskIds, tasks: project.tasks, status});
    let projectStatus = project.status;
    if(status === "Ready for Delivery") {
        projectStatus = getProjectStatus({tasks: updatedTasks, status: "Ready for Delivery", projectStatus});
    }
    if(status === "Delivered") {
        projectStatus = getProjectStatus({tasks: updatedTasks, status: "Delivered", projectStatus});
    }
    try {
        return await updateProject({"_id": project._id}, { tasks: updatedTasks, status: projectStatus});
    } catch(err) {
        console.log(err);
        console.log("Error in getProjectAfterTasksUpdated");
    }
}

function getProjectStatus({tasks, status, projectStatus}) {
    const otherStatusTask = tasks.find(item => item.status !== status);
    return otherStatusTask ? projectStatus : status;
}

function getUpdatedTasks({taskIds, tasks, status}) {
    return tasks.map(task => {
        if(taskIds.indexOf(task.taskId) !== -1) {
            task.status = status;
            task.isDelivered = status === "Delivered";
            task.deliveredTime = new Date();
        }
        return task;
    })
}

module.exports = { getProjectAfterApprove, getProjectAfterTasksUpdated }