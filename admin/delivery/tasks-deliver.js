const { getProjectAfterApprove } = require("./approve");
const { getProject } = require("../projects");

async function getAfterTasksDelivery(tasks) {
    const taskIds = tasks.map(item => item.taskId)
    try {
        const project = await getProject({"tasks.taskId": taskIds[0]})
        return await getProjectAfterApprove({taskIds, project, isDeliver: true});
    } catch(err) {
        console.log(err);
        console.log("Error in getAfterTasksDelivery");
    }
}

module.exports = { getAfterTasksDelivery }