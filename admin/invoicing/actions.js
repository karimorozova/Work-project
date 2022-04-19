const { getInvoice } = require("./getInvoicing")
const htmlToPdf = require("html-pdf")
const { getPdfInvoice } = require("../emailMessages/clientCommunication")
const { moveFile } = require("../utils")
const { updateInvoice } = require("./updateInvoice")


// const generateInvoiceFileAndSave = async (_invoiceId = '625d2ce37969e438bc78a68d') => {
const generateInvoiceFileAndSave = async (_invoiceId) => {
	const invoice = await getInvoice(_invoiceId)
	const template = getPdfInvoice(invoice)
	try {
		const path = await new Promise((resolve, reject) => {
			htmlToPdf.create(template, {
				type: 'pdf',
				width: '840',
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
	} catch (err) {
		console.log(err)
	}
}

// generateInvoiceFileAndSave()

const sendInvoice = async (_invoiceId, emails) => {
	await generateInvoiceFileAndSave(_invoiceId)
	// const report = await getInvoice(_invoiceId)
	// const pdfTemplate = getPdfInvoice()
	// console.log(report, pdfTemplate, _invoiceId, emails)
}

module.exports = {
	sendInvoice,
	generateInvoiceFileAndSave
}