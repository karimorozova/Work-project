const { InvoicingReceivables } = require('../models')
const { returnMessageAndType } = require('./helper')
const { getReportById } = require('./getReceivables')
const { sendEmail } = require('../utils/mailTemplate')

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

const sendInvoiceToClientContacts = async (_reportId) => {
	const attachments = []
	const [ report ] = await getReportById(_reportId)
	const { client, clientBillingInfo, total, reportId, lastPaymentDate } = report
	const { officialName, contacts } = client.billingInfo.find(({ _id }) => `${ _id }` === `${ clientBillingInfo }`)
	const subject = 'INVOICE READY PLS CHECK'

	attachments.push({ filename: 'TEST.txt', path: `clientReportsFiles\614ae626b3f5ea304853429e\TEST.txt` })
	const finalAttachments = attachments.map(item => ({ filename: item.filename, path: `./dist${ item.path }` }))

	for await (let contact of contacts) {
		const message = 'INVOICE READY'

		// const finalAttachments = attachmentsPaths.map(item => ({ filename: item.filename, path: `./dist${ item.path }` }))
		//
		// const message = projectDeliveryMessage({ comment, contact, accManager, projectId: updatedProject.projectId, projectName: updatedProject.projectName, id: updatedProject._id })
		await sendEmail({ to: contact.email, attachments: finalAttachments, subject }, message)
	}




}


module.exports = {
	sendInvoice,
	updateInvoiceReceivablesStatus,
	sendInvoiceToClientContacts
}