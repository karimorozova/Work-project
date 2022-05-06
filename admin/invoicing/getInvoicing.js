const { Invoice } = require("../models")

const getInvoices = async (query, queryPage, queryLimit, filters) => {
	const page = queryPage * 1 || 1
	const limit = queryLimit * 1 || 100
	const skip = (page - 1) * limit

	// const {
	//
	// } = filters
	return Invoice.find({})
			.populate('customer', [ 'name', 'currency' ])
			.populate('terms')
			.sort({"invoiceId": -1})
			.lean()
}

const getInvoice = async (invoiceId) => {
	return Invoice.findById(invoiceId)
			.populate('customer', [ 'name', 'billingInfo', 'currency', 'contacts' ])
			.populate('accountManager', [ 'firstName', 'lastName', 'email', 'photo' ])
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
