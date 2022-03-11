const { Invoice } = require("../models")

exports.createInvoice = async (customerId, clientBillingInfoId) => {
	try {
		const lastIndex = await Invoice.findOne().sort({ 'invoiceId': -1 }).lean()
		let lastIntIndex = lastIndex != null ? parseInt(lastIndex.invoiceId.split('_').pop()) : 100

		const invoice = await Invoice.create({customer: customerId, invoiceId: 'INV_' + (++lastIntIndex + '').padStart(6, "0"), clientBillingInfo: clientBillingInfoId})
		return invoice._id
	} catch (e) {

	}
}

exports.createInvoiceItem = async (invoicingId, itemData) => {
	try {

		const invoice = await Invoice.findByIdAndUpdate(invoicingId, {$push: {'items':  itemData}})
		return invoice._id
	} catch (e) {

	}
}
