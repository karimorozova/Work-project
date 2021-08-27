const  {
	getClientRequestById,
  getClientRequestAfterUpdate,
	getClientsRequests,
	removeClientRequestById,
	getClientsRequestsForPortal,
} = require('./getClientsRequests')

const {
	complianceService,
	createComplianceFiles,
	notifyAMsRequestCreated
} = require('./creatingRequiestsFromForms')


const {
	uploadRequestFiles,
	checkRequestedFiles,
	manageClientContacts,
} =  require('./clientRequestStep1')

const {
  updateClientRequestProps,
  updateClientContacts,
  removeContactClientRequest,
  sendMailToClient,
} =  require('./clientRequestStep2')

const {
	storeRequestFilesForTasksAndSteps,
	getTaskCopiedFiles,
	getTaskCopiedFilesFromRequestToProject,
} = require('./files')


module.exports = {
	notifyAMsRequestCreated,
	complianceService,
	createComplianceFiles,
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
  removeContactClientRequest,
  sendMailToClient,
	getClientsRequestsForPortal,
}
