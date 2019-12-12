const { getProjectAfterApprove } = require("./approve");
const { getProject } = require("../projects");

async function getAfterTasksDelivery(tasks) {
    const taskIds = tasks.map(item => item.taskId)
    try {
        const project = await getProject({"tasks.taskId": taskIds[0]})
        const contacts = project.customer.contacts.filter(item => item.leadContact).map(item=> item.email);
        let updatedProject = null;
        for(let taskId of taskIds) {
            updatedProject = await getProjectAfterApprove({taskId, project, isDeliver: true, contacts});
        }
        return updatedProject;
    } catch(err) {
        console.log(err);
        console.log("Error in getAfterTasksDelivery");
    }
}

module.exports = { getAfterTasksDelivery }