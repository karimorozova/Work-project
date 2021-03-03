const { getProjectAfterApprove } = require("./approve");
const { getProject } = require("../projects");

async function getAfterTasksDelivery(tasks, user) {
	const taskIds = tasks.map(item => item.taskId);
	try {
		const project = await getProject({ "tasks.taskId": taskIds[0] });
		const contacts = project.clientContacts.map(({ email, firstName, surname }) => {
			return { email, firstName, surname }
		});
		let updatedProject = null;
		for (let taskId of taskIds) {
			updatedProject = await getProjectAfterApprove({ taskId, project, isDeliver: true, contacts, user });
		}
		return updatedProject;
	} catch (err) {
		console.log(err);
		console.log("Error in getAfterTasksDelivery");
	}
}

module.exports = { getAfterTasksDelivery }