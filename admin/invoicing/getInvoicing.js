const { Invoice } = require("../models")

exports.getInvoices = async (query, queryPage, queryLimit, filters) => {
	const page = queryPage * 1 || 1
	const limit = queryLimit * 1 || 100
	const skip = (page - 1) * limit

	// const {
	//
	// } = filters
	return await Invoice.find({}).populate('customer', [ 'name' ]).lean()
}

exports.getInvoice = async (invoiceId) => {
	return await Invoice.findById(invoiceId).populate('customer', [ 'name', 'billingInfo' ]).populate('accountManager', ['firstName', 'lastName']).lean()
}