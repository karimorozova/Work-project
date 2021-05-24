const  {
	getClientRequestById,
	updateClientRequestProps,
	getClientsRequests,
	getClientRequestAfterUpdate
} = require('./getClientsRequests')

const {
	complianceService,
	createComplianceFiles
} = require('./creatingRequiestsFromForms')

module.exports = {
	complianceService,
	createComplianceFiles,
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
	getClientRequestAfterUpdate
}
