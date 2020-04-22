const { getProject, updateProject, notifyProjectDelivery } = require("../projects");

async function getAfterProjectDelivery(_id) {
    try {
        const project = await getProject({ _id });
        await notifyProjectDelivery(project);
        const updatedTasks = setTasksStatuses(project.tasks);
        return updateProject({ _id }, { status: "Closed", tasks: updatedTasks });
    } catch(err) {
        console.log(err);
        console.log("Error in getAfterProjectDelivery");
        throw new Error(err.message);
    }
}

function setTasksStatuses(tasks) {
    return tasks.map(task => {
        if(task.status === "Ready for Delivery") {
            task.isDelivered = true;
            task.deliveredTime = task.deliveredTime || new Date();
            task.status = "Delivered";
        }
        return task;
    })
}

module.exports = { getAfterProjectDelivery }