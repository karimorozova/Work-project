const { sendInvoiceToClientContacts } = require('./notification')
const { updateInvoiceReceivablesStatus } = require('./updateReceivables')
const { returnMessageAndType } = require('./helper')
const { getAllReportsFromDb } = require('./getReceivables')
const { setInvoiceStatus } = require('./zoho')
const { ObjectID: ObjectId } = require("mongodb")


const sendInvoice = async (_reportId) => {
	const [ report ] = await getAllReportsFromDb(0, 1, { _id: ObjectId(_reportId) })
	const { externalIntegration } = report
	try {
		await sendInvoiceToClientContacts(_reportId)
		await updateInvoiceReceivablesStatus(_reportId, 'Sent')

		// if (externalIntegration._id) {
		// 	await setInvoiceStatus(externalIntegration._id, 'sent')
		// }
		return returnMessageAndType('Invoice sent', 'success')
	} catch (e) {
		return returnMessageAndType('Error on sending', 'error')
	}
}


module.exports = {
	sendInvoice
}