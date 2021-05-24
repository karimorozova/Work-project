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


const {

} =  require('./clientRequestStep1')

const {

} =  require('./clientRequestStep2')


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
