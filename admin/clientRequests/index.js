const  {
	getClientRequestById,
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
  getClientRequestAfterUpdate,
  updateClientContacts,
} =  require('./clientRequestStep2')


module.exports = {
	complianceService,
	createComplianceFiles,
	uploadRequestFiles,
	checkRequestedFiles,
	manageClientContacts,
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
