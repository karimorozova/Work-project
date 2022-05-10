const { getInvoice } = require("./getInvoicing")
const htmlToPdf = require("html-pdf")
const { getPdfInvoice, getInvoiceSendTemplate } = require("../emailMessages/clientCommunication")
const { moveFile } = require("../utils")
const { updateInvoice } = require("./updateInvoice")
const { sendEmail } = require("../utils/mailTemplate")

const generateInvoiceFileAndSave = async (_invoiceId) => {
	const invoice = await getInvoice(_invoiceId)
	const template = getPdfInvoice(invoice)
	try {
		const path = await new Promise((resolve, reject) => {
			htmlToPdf.create(template, {
				type: 'pdf',
				width: '848',
				height: '1184',
				orientation: "landscape",
				base: process.env.ADMIN_URL,
				border: 0
			}).toFile('./dist/uploads/invoice.pdf', (err) => {
				if (err) {
					console.log(err)
					reject(new Error(err))
				}
				resolve('./dist/uploads/invoice.pdf')
			})
		})
		const newPath = `/invoice/${ _invoiceId }/invoice.pdf`
		await moveFile({ path }, './dist' + newPath)
		await updateInvoice(_invoiceId, { invoiceFile: { path: newPath, fileName: 'invoice.pdf' } })
		return newPath
	} catch (err) {
		console.log(err)
	}
}

const sendInvoice = async (_invoiceId, emails) => {
	const path = await generateInvoiceFileAndSave(_invoiceId)
	const invoice = await getInvoice(_invoiceId)
	const template = getInvoiceSendTemplate(invoice)
	const subject = `Invoice ${ invoice.invoiceId } is ready (C007.0)`
	const finalAttachment = { filename: 'invoice.pdf', path: `./dist${ path }` }
	await updateInvoice(_invoiceId, { status: 'Sent' })

	sendEmail({ to: 'maksym@pangea.global', attachments: [ finalAttachment ], subject }, template)
	// for (let email of emails) {
	// 	await sendEmail({ to: email, attachments: [ finalAttachment ], subject }, template)
	// }
}

module.exports = {
	sendInvoice,
	generateInvoiceFileAndSave
}