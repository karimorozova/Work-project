const { Clients } = require('../models')
const fs = require("fs")
const { moveFile } = require("../utils/movingFile")
const { getClientAfterUpdate, getClientWithActions } = require("./getClients")

const addClientContact = async (clientId, contactInfo, file) => {
	if (file.length) {
		contactInfo = await attachPhotos(file[0], contactInfo, clientId)
	}

	const client = await Clients.findOneAndUpdate({ _id: clientId }, { $push: { "contacts": contactInfo } }, { new: true }).lean()
	return { addedContact: client.contacts.find(({ email }) => contactInfo.email === email) }
}

const updateClientContact = async (clientId, contactInfo, file) => {
	if (file.length) {
		contactInfo = await attachPhotos(file[0], contactInfo, clientId)
	}
	const client = await Clients.findOneAndUpdate({ _id: clientId }, { "contacts.$[i]": contactInfo }, { new: true, arrayFilters: [ { 'i._id': contactInfo._id } ] })
	return { contacts: client.contacts }
}

const deleteClientContact = async (clientId, contactId) => {
	await Clients.updateOne({ _id: clientId }, { $pull: { "contacts": { _id: contactId }, "billingInfo.$[].contacts": contactId } })
	await Clients.updateOne({ _id: clientId, "contacts.leadContact": { $ne: true } }, { $set: { "contacts.0.leadContact": true } })
	return await getClientWithActions({ _id: clientId })
}


async function attachPhotos(file, contact, clientId) {
	try {
		const newPath = `/clientsDocs/${ clientId }/contacts/${ contact.firstName }-${ contact.surname }-${ file.filename }`
		await moveFile(file, `./dist${ newPath }`)
		contact.photo = newPath
		return contact
	} catch (err) {
		console.log(err)
		console.log("Error in attachPhotos")
	}
}


module.exports = { addClientContact, updateClientContact, deleteClientContact }