const { getProjectAfterApprove, setTasksDeliveryStatus } = require("./approve");
const { getAfterTasksDelivery } = require("./tasks-deliver");
const { checkPermission } = require("./review");

module.exports = {
    getProjectAfterApprove,
    setTasksDeliveryStatus,
    getAfterTasksDelivery,
    checkPermission
}