const { InvoicingPayables, InvoicingPayablesArchive } = require("../models")
const { moveProjectFile } = require('../utils/movingFile')
const fs = require('fs')
const ObjectId = require("mongodb").ObjectID

const setPayablesNextStatus = async (reportsIds, nextStatus, paymentMethod) => {
	await InvoicingPayables.updateMany({ _id: { $in: reportsIds } }, { status: nextStatus, 'paymentDetails.paymentMethod':  paymentMethod})
}

const invoiceReloadFile = async ({ reportId,  expectedPaymentDate, invoiceFile, oldPath }) => {
	await fs.unlink(`./dist${ oldPath }`, (err) => {
		if (err) console.log("Error in removeOldInvoiceFile")
	})
	return await invoiceSubmission({ reportId,  expectedPaymentDate, invoiceFile })
}

const invoiceSubmission = async ({ reportId, expectedPaymentDate, invoiceFile }) => {
	const fileName = `${ Math.floor(Math.random() * 1000000) }-${ invoiceFile[0].filename.replace(/( *[^\w\.]+ *)+/g, '_') }`
	const newPath = `/vendorReportsFiles/${ reportId }/${ fileName }`
	await moveProjectFile(invoiceFile[0], `./dist${ newPath }`)


	await InvoicingPayables.updateOne({ _id: reportId }, {
		status: 'Invoice Received',
		'paymentDetails.expectedPaymentDate': new Date(),
		'paymentDetails.file': {
			fileName,
			path: newPath
		},
	})
	return newPath
}

const paidOrAddPaymentInfo = async (reportId, data) => {
	const status = data.unpaidAmount <= 0 ? "Paid" : "Partially Paid"

	await InvoicingPayables.updateOne({ _id: reportId }, {$set: {status: status}, $push: { paymentInformation: data } })

	if ("Paid" === status) {
		await InvoicingPayables.aggregate([
			{	"$match": {"_id" : ObjectId(reportId) } },
			{
				"$merge" : {
					"into" : {
						"db" : "pangea",
						"coll" : "invoicingpayablesarchives"
					}
				}
			}
		])
		await InvoicingPayables.remove({_id: reportId})
		return "Moved"
	}

	return 'Success'

}

const updateZohoId = async (reportId, zohoBillingId) => {
	console.log(zohoBillingId)
	const newInvoicing = await InvoicingPayables.findByIdAndUpdate(reportId, { zohoBillingId })
	return newInvoicing
}
module.exports = { setPayablesNextStatus, paidOrAddPaymentInfo, invoiceSubmission, invoiceReloadFile, updateZohoId }