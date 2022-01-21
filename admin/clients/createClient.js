const { Pricelist, Clients } = require("../models")

const createClient = async (client) => {
	const { discountChart } = await Pricelist.findOne({ _id: client.defaultPricelist })
	client.matrix = discountChart
	let result = await Clients.create(client)


	const contactIds = result.contacts.map(({_id}) => _id)

	const finalUpdate = await Clients.findByIdAndUpdate(result._id, { $set:  {"billingInfo.$[].contacts":  contactIds } } )
	return finalUpdate
}

const getContactsIdsWithCreate = async (_id, billingInfo) => {
	let contactEmailsToAdd = []
	const client = await Clients.findById(_id)
	billingInfo.contacts.forEach((contact) => {
		if (!contact.hasOwnProperty("_id")) {
			client.contacts.push(contact)
		}
		contactEmailsToAdd.push(contact.email)
	})
	await client.save()

	const test = await Clients.findById(_id).lean()

	return test.contacts.filter(({email}) => {
		return contactEmailsToAdd.includes(email)
	}).map(({_id}) => _id.toString())
}

module.exports = { createClient, getContactsIdsWithCreate }