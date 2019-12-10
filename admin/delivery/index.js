const { getProjectAfterApprove, setTasksDeliveryStatus } = require("./approve");
const { getAfterTasksDelivery } = require("./tasks-deliver");
const { checkPermission, changeReviewStage } = require("./review");

module.exports = {
    getProjectAfterApprove,
    setTasksDeliveryStatus,
    getAfterTasksDelivery,
    checkPermission,
    changeReviewStage
}