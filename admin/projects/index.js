const {
	getProject,
	getProjects,
	updateProject,
	getFilteredProjects,
	getProjectAfterUpdate
} = require('./getProjects')

const {
	storeFiles,
	createArchiveForDeliverableItem,
	manageDeliveryFile,
	getPdf,
	generateAndSaveCertificate
} = require('./files')

const {
	getProjectAfterCancelTasks,
	updateProjectStatus,
	setStepsStatus,
	updateWithApprovedTasks,
	downloadCompletedFiles,
	updateProjectProgress,
	getAfterReopenSteps,
	updateNonWordsTaskTargetFiles,
	updateOtherProject,
	assignMemoqTranslator,
	checkProjectHasMemoqStep,
	assignProjectManagers,
	updateProjectStatusForClientPortalProject,
	regainWorkFlowStatusByStepId
} = require('./updates')

const {
	stepCancelNotifyVendor,
	getMessage,
	taskCompleteNotifyPM,
	notifyManagerStepStarted,
	notifyStepDecisionMade,
	notifyDeliverablesDownloaded,
	stepCompletedNotifyPM,
	notifyReadyForDr2,
	notifyStepReopened,
	notifyVendorStepStart,
	sendQuoteMessage,
	sendCostQuoteMessage
} = require('./emails')

const {
	createProject,
	createTasks,
	createTasksFromRequest
} = require('./create')

const {
	createTasksForWordcount
} = require('./taskForWordcount')

const {
	getProjectWithUpdatedFinance
} = require('./metrics')

const {
	getProjectAfterFinanceUpdated,
	updateProjectFinanceOnDiscountsUpdate
} = require('./porjectFinance')

const {
	addDR2,
	addMultiLangDR2,
	removeDR2,
	removeMultiDR2,
	taskApproveReady,
	taskApproveNotify,
	taskApproveDeliver,
	taskApproveDeliverMany,
	changeManagerDR2,
	changeManager,
	rollbackReview,
	targetFileDR2,
	changeTaskStatus,
	targetFileDR1,
	approveInstructionDR2,
	approveFilesDR2,
	changeManagersDR1,

} = require('./delivery')

const {
	getPriceAfterApplyingDiscounts
} = require('./helpers')

module.exports = {
	changeManagersDR1,
	approveFilesDR2,
	approveInstructionDR2,
	targetFileDR1,
	changeTaskStatus,
	targetFileDR2,
	rollbackReview,
	changeManagerDR2,
	changeManager,
	taskApproveDeliverMany,
	createArchiveForDeliverableItem,
	taskApproveDeliver,
	taskApproveNotify,
	taskApproveReady,
	removeDR2,
	generateAndSaveCertificate,
	getProject,
	getProjects,
	updateProject,
	updateOtherProject,
	getFilteredProjects,
	storeFiles,
	manageDeliveryFile,
	getProjectAfterCancelTasks,
	updateProjectStatus,
	stepCancelNotifyVendor,
	setStepsStatus,
	createProject,
	createTasks,
	getMessage,
	taskCompleteNotifyPM,
	notifyDeliverablesDownloaded,
	getProjectWithUpdatedFinance,
	updateProjectProgress,
	updateWithApprovedTasks,
	getAfterReopenSteps,
	getProjectAfterFinanceUpdated,
	updateNonWordsTaskTargetFiles,
	createTasksFromRequest,
	createTasksForWordcount,
	downloadCompletedFiles,
	notifyManagerStepStarted,
	stepCompletedNotifyPM,
	notifyStepDecisionMade,
	notifyReadyForDr2,
	notifyStepReopened,
	getPdf,
	notifyVendorStepStart,
	getProjectAfterUpdate,
	assignMemoqTranslator,
	checkProjectHasMemoqStep,
	assignProjectManagers,
	updateProjectStatusForClientPortalProject,
	sendQuoteMessage,
	sendCostQuoteMessage,
	updateProjectFinanceOnDiscountsUpdate,
	getPriceAfterApplyingDiscounts,
	regainWorkFlowStatusByStepId,
	addDR2,
	addMultiLangDR2,
	removeMultiDR2
}
