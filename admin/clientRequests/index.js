const  {
	getClientRequestById,
  getClientRequestAfterUpdate,
	getClientsRequests,
} = require('./getClientsRequests')

const {
	complianceService,
	createComplianceFiles
} = require('./creatingRequiestsFromForms')


const {
	uploadRequestFiles,
	checkRequestedFiles,
	manageClientContacts,
} =  require('./clientRequestStep1')

const {
  updateClientRequestProps,
  updateClientContacts,
} =  require('./clientRequestStep2')

const {
	storeRequestFilesForTasksAndSteps,
	getTaskCopiedFiles
} = require('./files')


module.exports = {
	complianceService,
	createComplianceFiles,
	uploadRequestFiles,
	checkRequestedFiles,
	manageClientContacts,
	storeRequestFilesForTasksAndSteps,
	getTaskCopiedFiles,
	// getClientRequest,
	// getClientRequests,
	// updateClientRequest,
	// getFilteredClientRequests,
	// createRequest,
	// storeRequestFiles,
	// addRequestFile,
	// removeRequestFile,
	// removeRequestFiles,
	// clientRequestNotification,
	// sendNotificationToManager,
	// removeClientRequest,
	// notifyRequestCancelled
	getClientsRequests,
	getClientRequestById,
	updateClientRequestProps,
	getClientRequestAfterUpdate,
  updateClientContacts,
}
