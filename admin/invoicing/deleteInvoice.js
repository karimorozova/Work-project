const { Invoice, InvoicingClientReports } = require("../models")


deleteInvoiceItem = async (invoiceId, itemId) => {
	try {
		await Invoice.findByIdAndUpdate(invoiceId, {"$pull":{ 'items': {'_id': itemId}}})
		return "success"
	} catch (e) {

	}
}

deleteInvoiceItemByReportId = async (invoiceId, reportId) => {
	try {
		await Invoice.findByIdAndUpdate(invoiceId, {"$pull":{ 'items': {'reportId': reportId}}})
		return "success"
	} catch (e) {

	}
}

deleteInvoiceItemFromReport = async ( invoiceId, reportId) => {
	try {
		await deleteInvoiceItemByReportId(invoiceId, reportId)
		await InvoicingClientReports.findByIdAndUpdate(reportId, {invoice: null})
	} catch (e) {

	}
}


module.exports = {
	deleteInvoiceItem,
	deleteInvoiceItemFromReport,
}