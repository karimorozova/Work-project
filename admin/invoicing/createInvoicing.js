const { Invoice} = require("../models")

const createInvoice = async (customerId, clientBillingInfoId) => {
	try {
		console.log(customerId, clientBillingInfoId)
		const invoice = await Invoice.create({customer: customerId, clientBillingInfo: clientBillingInfoId})
		return invoice._id
	} catch (e) {

	}
}

const updateInvoice = async ({}) => {
	try {
		const invoice = await Invoice.create({customer: customerId, clientBillingInfo: clientBillingInfoId})
		return invoice._id
	} catch (e) {

	}
}


module.exports = {
	createInvoice
}