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
  changeManagerDR2
	// dr1Instructions
} = require("./review")

module.exports = {
	getProjectAfterApprove,
	setTasksDeliveryStatus,
	getAfterTasksDelivery,
	getAfterProjectDelivery,
	checkPermission,
	changeManager,
  changeManagerDR2,
	changeReviewStage,
	rollbackReview,
	// dr1Instructions
}
