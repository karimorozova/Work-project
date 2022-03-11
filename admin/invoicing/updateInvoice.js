const { Invoice } = require('../models')


exports.updateInvoice = async (invoiceId, updateData) => {
	try {
		const invoice = await Invoice.findByIdAndUpdate(invoiceId, updateData)
		return invoice._id
	} catch (e) {

	}
}

exports.updateInvoiceItem = async (invoiceId, updateData) => {
	try {
		const invoice = await Invoice.findByIdAndUpdate(invoiceId, updateData)
		return invoice._id
	} catch (e) {

	}
}