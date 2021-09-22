const { InvoicingReceivables } = require('../models')
const { returnMessageAndType } = require('./helper')

const updateInvoiceReceivablesStatus = async (reportId, status) => {
	await InvoicingReceivables.update({ _id: reportId }, { status })
}

const sendInvoice = async (reportId) => {
	console.log(reportId, 'SEND')

	try {
		await updateInvoiceReceivablesStatus(reportId, 'Sent')

		return returnMessageAndType('Invoice sent', 'success')
	} catch (e) {

	}


}


module.exports = {
	sendInvoice,
	updateInvoiceReceivablesStatus
}