const { getProjectAfterApprove, setTasksDeliveryStatus } = require("./approve");
const { getAfterTasksDelivery } = require("./tasks-deliver");

module.exports = {
    getProjectAfterApprove,
    setTasksDeliveryStatus,
    getAfterTasksDelivery
}