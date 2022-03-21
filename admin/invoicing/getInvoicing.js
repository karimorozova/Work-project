const { Invoice } = require("../models")

const getInvoices = async (query, queryPage, queryLimit, filters) => {
	const page = queryPage * 1 || 1
	const limit = queryLimit * 1 || 100
	const skip = (page - 1) * limit

	// const {
	//
	// } = filters
	return Invoice.find({}).populate('customer', [ 'name' ]).lean()
}

const getInvoice = async (invoiceId) => {
	return Invoice.findById(invoiceId).populate('customer', [ 'name', 'billingInfo' ]).populate('accountManager', ['firstName', 'lastName']).lean()
}

const getInvoicesForOptions = async () => {
	return Invoice.find({}, {invoiceId: 1})

}
module.exports = {
	getInvoice,
	getInvoices,
	getInvoicesForOptions,
}