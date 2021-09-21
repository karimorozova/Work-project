const { InvoicingReceivables } = require('../models')

const updateInvoiceReceivablesStatus = async (reportId, status) => {
	await InvoicingReceivables.update({ _id: reportId }, { status })
}

module.exports = {
	updateInvoiceReceivablesStatus
}