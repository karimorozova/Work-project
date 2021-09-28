const { sendInvoiceToClientContacts } = require('./notification')
const { updateInvoiceReceivablesStatus } = require('./updateReceivables')
const { returnMessageAndType } = require('./helper')
const { getReportById } = require('./getReceivables')
const { setInvoiceStatus } = require('./zoho')


const sendInvoice = async (_reportId) => {
	const [ report ] = await getReportById(_reportId)
	const { externalIntegration } = report
	try {
		await sendInvoiceToClientContacts(_reportId)
		await updateInvoiceReceivablesStatus(_reportId, 'Sent')
		if (externalIntegration._id) {
			await setInvoiceStatus(externalIntegration._id, 'sent')
		}
		return returnMessageAndType('Invoice sent', 'success')
	} catch (e) {
		return returnMessageAndType('Error on sending', 'error')
	}
}


module.exports = {
	sendInvoice
}