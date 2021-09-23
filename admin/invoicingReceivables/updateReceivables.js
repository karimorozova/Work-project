const { InvoicingReceivables } = require('../models')
const { returnMessageAndType } = require('./helper')
const { getReportById } = require('./getReceivables')

const updateInvoiceReceivablesStatus = async (reportId, status) => {
	await InvoicingReceivables.updateOne({ _id: reportId }, { status })
}


module.exports = {
	updateInvoiceReceivablesStatus
}