const { Pricelist, Clients, User, PaymentTerms } = require("../models")
const { getClientAfterUpdate } = require("./getClients")

const createClient = async ({ client, user }) => {
	if (!client.name || !client.email) throw new Error('Email and Name is required')
	const defaultClientPriceList = await Pricelist.findOne({ isClientDefault: true })
	const paymentTerms = await PaymentTerms.findOne({ name: '1 Day' })

	if (!user) {
		const users = await User.find().populate("groups")
		user = users.find(user => user.group.name === 'Administrators')
	}

	const { projectManager, accountManager, name, email, contacts, defaultPricelist, leadSource, status, clientType } = client

	client = {
		...client,
		status: status || 'Active',
		clientType: clientType || 'Individual',
		projectManager: projectManager || user,
		accountManager: accountManager || user,
		name,
		email,
		contacts: contacts && contacts.length ? contacts : { leadContact: true, firstName: name, email, position: "Manager" },
		defaultPricelist: defaultPricelist || defaultClientPriceList,
		leadSource: leadSource || "API",
		matrix: defaultClientPriceList.discountChart
	}

	let result = await Clients.create(client)

	const billingInfo = {
		name,
		officialName: name,
		paymentTerms,
		contacts: result.contacts.map(({ _id }) => _id)
	}

	return await getClientAfterUpdate({ _id: result._id }, { $set: { billingInfo } })
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

	return test.contacts.filter(({ email }) => {
		return contactEmailsToAdd.includes(email)
	}).map(({ _id }) => _id.toString())
}

module.exports = { createClient, getContactsIdsWithCreate }