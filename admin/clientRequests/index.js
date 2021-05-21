// const { getClientRequest, getClientRequests, updateClientRequest, getFilteredClientRequests } = require("./get");
// const { createRequest } = require("./create");
// const { storeRequestFiles, addRequestFile, removeRequestFile, removeRequestFiles, removeClientRequest } = require('./files');
// const { clientRequestNotification, sendNotificationToManager, notifyRequestCancelled } = require('./emails');


const  {
	getClientRequestById,
	updateClientRequestProps,
	getClientsRequests 
} = require('./getClientsRequests')

module.exports = {
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
	updateClientRequestProps
}
