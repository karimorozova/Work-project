const { Pricelist, Clients, User, PaymentTerms } = require("../models")
const Response = require('../helpers/Response')

const createClient = async (client) => {
	if (!client.name || !client.email)  throw new Error('Email and Name is required')

	const users = await User.find().populate("groups")
	const admin = users.find(user => user.group.name === 'Administrators')

	const defaultClientPriceList = await Pricelist.findOne({isClientDefault: true})

	const paymentTerms = await PaymentTerms.findOne({name: '30 Days'})

	const { projectManager, accountManager, name, email, contacts, defaultPricelist,  leadSource } = client

	client = {
		...client,
		projectManager: projectManager || admin,
		accountManager: accountManager || admin,
		name,
		email,
		contacts: contacts && contacts.length ? contacts : { leadContact: true, firstName: name, email, position: "Manager" },
		defaultPricelist: defaultPricelist || defaultClientPriceList,
		leadSource: leadSource || "API",
		matrix: defaultClientPriceList.discountChart,
	}

	let result = await Clients.create(client)

	const billingInfo = {
		name,
		officialName: name,
		paymentTerms,
		contacts: result.contacts.map(({_id}) => _id),
	}


	const finalUpdate = await Clients.findByIdAndUpdate(result._id, { $set: { billingInfo }  } )
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