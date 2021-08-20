const { InvoicingReports, InvoicingReportsArchive } = require("../models")
const { moveProjectFile } = require('../utils/movingFile')
const fs = require('fs')

const setReportsNextStatus = async (reportsIds, nextStatus) => {
	await InvoicingReports.updateMany({ _id: { $in: reportsIds } }, { status: nextStatus })
}

const invoiceReloadFile = async ({ reportId, paymentMethod, expectedPaymentDate, invoiceFile, oldPath }) => {
	await fs.unlink(`./dist${ oldPath }`, (err) => {
		if (err) console.log("Error in removeOldInvoiceFile")
	})
	await invoiceSubmission({ reportId, paymentMethod, expectedPaymentDate, invoiceFile })
}

const invoiceSubmission = async ({ reportId, paymentMethod, expectedPaymentDate, invoiceFile }) => {
	const fileName = `${ Math.floor(Math.random() * 1000000) }-${ invoiceFile[0].filename.replace(/( *[^\w\.]+ *)+/g, '_') }`
	const newPath = `/vendorReportsFiles/${ reportId }/${ fileName }`
	await moveProjectFile(invoiceFile[0], `./dist${ newPath }`)

	await InvoicingReports.updateOne({ _id: reportId }, {
		status: 'Invoice Received',
		paymentDetails: {
			paymentMethod,
			expectedPaymentDate,
			file: {
				fileName,
				path: newPath
			}
		}
	})
}

const paidOrAddPaymentInfo = async (reportId, data) => {
	const status = data.unpaidAmount <= 0 ? "Paid" : "Partially Paid"

	await InvoicingReports.updateOne({ _id: reportId }, {$set: {status: status}, $push: { paymentInformation: data } })

	if ("Paid" === status) {
		const {_id, ...neededInvoicing} = await InvoicingReports.findOne({_id: reportId})
		await InvoicingReportsArchive.create(neededInvoicing)
		// await InvoicingReports.remove({_id: reportId})
	}

	return 'success'

}
module.exports = { setReportsNextStatus, paidOrAddPaymentInfo, invoiceSubmission, invoiceReloadFile }