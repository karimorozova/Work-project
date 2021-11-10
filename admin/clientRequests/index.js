const {
	getClientRequestById,
	getClientRequestAfterUpdate,
	getClientsRequests,
	removeClientRequestById,
	getClientsRequestsForPortal,
	getClientsRequestForPortal,
} = require('./getClientsRequests')

const {
	newClientServiceRequest,
	createRequestFiles,
	notifyAMsRequestCreated,
	translationServiceRequest
} = require('./creatingRequiestsFromForms')


const {
	uploadRequestFiles,
	checkRequestedFiles,
	manageClientContacts
} = require('./clientRequestStep1')

const {
	updateClientRequestProps,
	updateClientContacts,
	removeContactClientRequest,
	sendMailToClient
} = require('./clientRequestStep2')

const {
	storeRequestFilesForTasksAndSteps,
	getTaskCopiedFiles,
	getTaskCopiedFilesFromRequestToProject
} = require('./files')


module.exports = {
	translationServiceRequest,
	notifyAMsRequestCreated,
	newClientServiceRequest,
	createRequestFiles,
	uploadRequestFiles,
	checkRequestedFiles,
	manageClientContacts,
	storeRequestFilesForTasksAndSteps,
	getTaskCopiedFiles,
	getTaskCopiedFilesFromRequestToProject,
	getClientsRequests,
	getClientRequestById,
	updateClientRequestProps,
	getClientRequestAfterUpdate,
	updateClientContacts,
	removeClientRequestById,
	// removeContactClientRequest,
	// sendMailToClient,
	removeContactClientRequest,
	sendMailToClient,
	getClientsRequestsForPortal,
	getClientsRequestForPortal,
}
