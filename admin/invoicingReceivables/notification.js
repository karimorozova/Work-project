const { sendEmail } = require('../utils/mailTemplate')
const { getReportById } = require('./getReceivables')
const { generateReportPPP } = require('./statisticReportsGeneration')

const sendInvoiceToClientContacts = async (_reportId) => {
	const subject = 'INVOICE READY PLS CHECK'
	const attachments = []
	const [ report ] = await getReportById(_reportId)
	const { client, clientBillingInfo, total, reportId, lastPaymentDate, invoice, reportFiles } = report
	const { officialName, contacts, paymentType } = client.billingInfo.find(({ _id }) => `${ _id }` === `${ clientBillingInfo }`)

	if(paymentType === 'PPP'){
		await generateReportPPP(_reportId)
	}
	console.log(reportFiles)
	if(reportFiles.length) for(let file of reportFiles) attachments.push({ ...file })
	attachments.push({ filename: invoice.filename, path: invoice.path })

	console.log(attachments)

	const finalAttachments = attachments.map(item => ({ filename: item.filename.split('-').pop(), path: `./dist/${ item.path }` }))

	//--------- TODO удалить н=>
	for await (let contact of [ { email: 'maksym@pangea.global' } ]) {
		const message = 'INVOICE READY'
		await sendEmail({ to: contact.email, attachments: finalAttachments, subject }, message)
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