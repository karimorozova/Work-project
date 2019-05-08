const { getProjectAfterApprove, getProjectAfterTasksUpdated } = require("./approve");
const { getAfterTasksDelivery } = require("./tasks-deliver");

module.exports = {
    getProjectAfterApprove,
    getProjectAfterTasksUpdated,
    getAfterTasksDelivery
}