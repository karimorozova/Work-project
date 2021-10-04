const { sendEmail } = require('../utils/mailTemplate')
const { getReportById } = require('./getReceivables')
const { generateReportPPP } = require('./statisticReportsGeneration')
const { invoicingMessage } = require('../emailMessages/clientCommunication')

const sendInvoiceToClientContacts = async (_reportId = "614c67225a835d39a356670f") => {
	const attachments = []
	const reportFiles = []
	const [ report ] = await getReportById(_reportId)
	const { client, clientBillingInfo, total, reportId, lastPaymentDate, invoice, externalIntegration } = report
	const BI = client.billingInfo.find(({ _id }) => `${ _id }` === `${ clientBillingInfo }`)
	const { officialName, contacts, paymentType, currency } = BI
	const subject = `Invoice ${ externalIntegration._id || '' } is ready (C007.0)`

	if (paymentType === 'PPP') {
		reportFiles.push(await generateReportPPP(_reportId, report, BI))
	}

	if (reportFiles.length) for (let file of reportFiles) attachments.push({ ...file })
	attachments.push({ filename: invoice.filename, path: invoice.path })
	const finalAttachments = attachments.map(item => ({ filename: item.filename.split('-').pop(), path: `./dist/${ item.path }` }))

	//--------- TODO удалить н=>
	for await (let contact of [ { email: 'maksym@pangea.global' }, { email: 'dmitrii@pangea.global' } ]) {
		const message = invoicingMessage(contact, report, currency)
		await sendEmail({ to: contact.email, attachments: finalAttachments, subject}, message)
	}
	//----------------------------------

	// TODO: уже для работы реальных контатов!
	// for await (let contact of contacts) {
	// 	const message = 'INVOICE READY'
	// 	await sendEmail({ to: contact.email, attachments: finalAttachments, subject }, message)
	// }
}

module.exports = {
	sendInvoiceToClientContacts
}