const { storeRequestFiles } = require('./files')
const { getClientRequestById } = require('./getClientsRequests')
const { ClientRequest } = require('../models')

const uploadRequestFiles = async (formData, files) => {
	const { type, projectId } = formData

	if (type === 'Source') {
		const uploadedFiles = await storeRequestFiles(files.sourceFiles, projectId)
		await ClientRequest.updateOne({ "_id": projectId }, { $push: { "requestForm.sourceFiles": uploadedFiles } })
	}
	if (type === 'Reference') {
		const uploadedFiles = await storeRequestFiles(files.refFiles, projectId)
		await ClientRequest.updateOne({ "_id": projectId }, { $push: { "requestForm.refFiles": uploadedFiles } })
	}

	return await getClientRequestById(projectId)
}

const checkRequestedFiles = async ({ projectId, path, check, type }) => {

	if (type === 'Source') await ClientRequest.updateOne(
			{ "_id": projectId, 'requestForm.sourceFiles.path': path },
			{ 'requestForm.sourceFiles.$[i].isCheck': check },
			{ arrayFilters: [ { 'i.path': path } ] })

	if (type === 'Reference') await ClientRequest.updateOne(
			{ "_id": projectId, 'requestForm.refFiles.path': path },
			{ 'requestForm.refFiles.$[i].isCheck': check },
			{ arrayFilters: [ { 'i.path': path } ] })

	return await getClientRequestById(projectId)
}

const manageClientContacts = async ({ contact, action, projectId }) => {
	if (action === 'Add') await ClientRequest.updateOne({ "_id": projectId }, { $push: { "clientContacts": contact } })
	if (action === 'Delete') await ClientRequest.updateOne({ "_id": projectId }, { $pull: { "clientContacts": { "_id": contact._id } } })

	return await getClientRequestById(projectId)
}

module.exports = {
	uploadRequestFiles,
	checkRequestedFiles,
	manageClientContacts
}