const { getInvoice } = require("./getInvoicing")
const htmlToPdf = require("html-pdf")
const { getPdfInvoice } = require("../emailMessages/clientCommunication")
const { moveFile } = require("../utils")
const { updateInvoice } = require("./updateInvoice")


const generateInvoiceFileAndSave = async (_invoiceId) => {
	const template = getPdfInvoice()
	try {
		const path = await new Promise((resolve, reject) => {
			htmlToPdf.create(template, {
				type: 'pdf',
				width: '814',
				height: '1054',
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
		const newPath = `invoice/${ _invoiceId }/invoice.pdf`
		await moveFile({ path }, './dist/' + newPath)
		await updateInvoice(_invoiceId, { invoiceFile: { path: newPath, fileName: 'invoice.pdf' } })
	} catch (err) {
		console.log(err)
	}
}

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