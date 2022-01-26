const {Clients} = require('../models')

const addContactToBilling = async (clientId, billingId, contactsIds) => {
	await Clients.updateOne({_id: clientId}, {$push : {"billingInfo.$[i].contacts": contactsIds}}, { arrayFilters: [ { 'i._id': billingId  } ] })
}
const removeContactToBilling = async (clientId, billingId, contactId) => {
	await Clients.updateOne({_id: clientId}, {$pull : {"billingInfo.$[i].contacts": contactId}}, { arrayFilters: [ { 'i._id': billingId  } ] })
}
module.exports = { addContactToBilling, removeContactToBilling }