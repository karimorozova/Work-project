const {
	getProjectAfterApprove,
	setTasksDeliveryStatus
} = require("./approve")
const { getAfterTasksDelivery } = require("./tasks-deliver")
const { getAfterProjectDelivery } = require("./projectDeliver")
const {
	checkPermission,
	changeManager,
	changeReviewStage,
	rollbackReview,
	dr1Instructions
} = require("./review")

module.exports = {
	getProjectAfterApprove,
	setTasksDeliveryStatus,
	getAfterTasksDelivery,
	getAfterProjectDelivery,
	checkPermission,
	changeManager,
	changeReviewStage,
	rollbackReview,
	dr1Instructions
}
