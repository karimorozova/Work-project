const {
	getProject,
	getProjects,
	getProjectsForPortal,
	updateProject,
	getFilteredProjects,
	getProjectAfterUpdate,
	getProjectsForVendorPortal,
	getProjectsForPortalList,
} = require('./getProjects')

const {
	storeFiles,
	createArchiveForDeliverableItem,
	manageDeliveryFile,
	getPdf,
	generateAndSaveCertificate,
	copyProjectFiles,
	generatePOFile,
	generateReceivablesReportsByTemplate
} = require('./files')

const {
	getProjectAfterCancelTasks,
	updateProjectStatus,
	updateWithApprovedTasks,
	downloadCompletedFiles,
	updateProjectProgress,
	getAfterReopenSteps,
	updateNonWordsTaskTargetFile,
	updateNonWordsTaskTargetFiles,
	updateOtherProject,
	assignMemoqTranslator,
	checkProjectHasMemoqStep,
	assignProjectManagers,
	updateProjectStatusForClientPortalProject,
	regainWorkFlowStatusByStepId,
	setStepDeadlineProjectAndMemoq,
	cancelProjectInMemoq,
	setApprovedStepStatus
} = require('./updates')

const {
	stepCancelNotifyVendor,
	taskCompleteNotifyPM,
	notifyManagerStepStarted,
	notifyStepDecisionMade,
	stepCompletedNotifyPM,
	notifyStepReopened,
	notifyVendorStepStart,
	sendQuoteMessage,
	sendCostQuoteMessage,
	nextVendorCanStartWorkNotification,
} = require('./emails')

const {
	createProject,
	createTasks,
	createRequestTasks,
	updateRequestTasks,
	createProjectFromRequest,
	autoCreatingTaskInProject,
	autoCreatingTranslationTaskInProject
} = require('./create')


const {
	createTasksForWordcount
} = require('./taskForWordcount')

// const {
// 	getProjectWithUpdatedFinance
// } = require('./metrics')

const {
	getProjectAfterFinanceUpdated,
	// addPaymentAdditions,
	// deletePaymentAddition,
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
	saveCertificateTODR1Files,
	changeNameLang,
} = require('./delivery')

const {
	getPriceAfterApplyingDiscounts,
	manageProjectName
} = require('./helpers')

module.exports = {
	setApprovedStepStatus,
	getProjectsForVendorPortal,
	generateReceivablesReportsByTemplate,
	generatePOFile,
	nextVendorCanStartWorkNotification,
	cancelProjectInMemoq,
	autoCreatingTranslationTaskInProject,
	manageProjectName,
	copyProjectFiles,
	setStepDeadlineProjectAndMemoq,
	saveCertificateTODR1Files,
	autoCreatingTaskInProject,
	createProjectFromRequest,
	updateRequestTasks,
	createRequestTasks,
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
	createProject,
	createTasks,
	taskCompleteNotifyPM,
	// getProjectWithUpdatedFinance,
	updateProjectProgress,
	updateWithApprovedTasks,
	getAfterReopenSteps,
	getProjectAfterFinanceUpdated,
	updateNonWordsTaskTargetFile,
	updateNonWordsTaskTargetFiles,
	createTasksForWordcount,
	downloadCompletedFiles,
	notifyManagerStepStarted,
	stepCompletedNotifyPM,
	notifyStepDecisionMade,
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
	getPriceAfterApplyingDiscounts,
	regainWorkFlowStatusByStepId,
	addDR2,
	addMultiLangDR2,
	removeMultiDR2,
	changeNameLang,
	getProjectsForPortal,
	getProjectsForPortalList,
	// addPaymentAdditions,
	// deletePaymentAddition,
}
