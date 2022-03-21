const { Invoice } = require('../models')


exports.updateInvoice = async (invoiceId, updateData) => {
	try {
		const invoice = await Invoice.findByIdAndUpdate(invoiceId, updateData)
		return invoice._id
	} catch (e) {

	}
}

exports.updateInvoiceItem = async (invoiceId, itemId, updateData) => {
	try {
		const invoice = await Invoice.findByIdAndUpdate(invoiceId, {'items.$[i]': updateData}, {arrayFilters: [{'i._id': itemId}]})
		return invoice._id
	} catch (e) {

	}
}




// { 'requestForm.sourceFiles.$[i].isCheck': check },
// { arrayFilters: [ { 'i.path': path } ] })