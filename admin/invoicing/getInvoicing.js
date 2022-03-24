const { Invoice } = require("../models")

const getInvoices = async (query, queryPage, queryLimit, filters) => {
	const page = queryPage * 1 || 1
	const limit = queryLimit * 1 || 100
	const skip = (page - 1) * limit

	// const {
	//
	// } = filters
	return Invoice.find({})
			.populate('customer', [ 'name' ]).lean()
			.populate('terms')
}

const getInvoice = async (invoiceId) => {
	return Invoice.findById(invoiceId)
			.populate('customer', [ 'name', 'billingInfo' ])
			.populate('accountManager', [ 'firstName', 'lastName' ])
			.populate('terms')
			.lean()
}

const getInvoicesForOptions = async (query) => {
	return Invoice.find({ ...query }, { invoiceId: 1 }).sort({ _id: -1 })

}
module.exports = {
	getInvoice,
	getInvoices,
	getInvoicesForOptions
}