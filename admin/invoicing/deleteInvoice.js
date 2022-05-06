const { Invoice, InvoicingClientReports, Projects } = require("../models")
const { removeDir } = require("../utils/folder")
const { ObjectID: ObjectId } = require("mongodb")
const DIR = './dist/invoice/'

const deleteInvoiceItem = async (invoiceId, itemId) => {
	try {
		await removeDir(DIR, invoiceId.toString())
		await Invoice.findByIdAndUpdate(invoiceId, { "$pull": { 'items': { '_id': itemId } } })
	} catch (e) {
	}
}

const deleteInvoice = async (id) => {
	try {
		await InvoicingClientReports.updateMany({ "invoice": id }, { invoice: null })
		await Projects.updateMany({"steps.invoiceId": id}, {$set: {"steps.$[i].invoiceId":  null}}, {arrayFilters: [{'i.invoiceId': id}]})
		await Projects.updateMany({"additionsSteps.invoiceId": id}, {$set: {"additionsSteps.$[i].invoiceId":  null}}, {arrayFilters: [{'i.invoiceId': id}]})
		await Invoice.findByIdAndDelete(id)
	} catch (e) {

	}

}

const deleteInvoiceItemByReportId = async (_invoiceId, _reportId) => {
	try {
		const find = { _id: _invoiceId }
		await Invoice.updateOne(find, { "$pull": { 'items': { 'reportId': _reportId } } })
		const { items } = await Invoice.findOne(find)
		if (!items.length) {
			await removeDir(DIR, _invoiceId.toString())
			await Invoice.deleteOne(find)
		}
	} catch (e) {
	}
}

const deleteInvoiceItemFromReport = async (_invoiceId, _reportId) => {
	try {
		await deleteInvoiceItemByReportId(_invoiceId, _reportId)
		await InvoicingClientReports.findByIdAndUpdate(_reportId, { invoice: null })
	} catch (e) {
	}
}


module.exports = {
	deleteInvoiceItem,
	deleteInvoiceItemFromReport,
	deleteInvoice,
}