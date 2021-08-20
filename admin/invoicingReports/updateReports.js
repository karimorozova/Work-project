const { InvoicingReports, InvoicingReportsArchive } = require("../models")
const { moveProjectFile } = require('../utils/movingFile')
const fs = require('fs')
const ObjectId = require("mongodb").ObjectID

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
		await InvoicingReports.aggregate([
			{	"$match": {"_id" : ObjectId(reportId) } },
			{"$unset" : [	"_id"	]	},
			{
				"$merge" : {
					"into" : {
						"db" : "pangea",
						"coll" : "invoicingreportsarchives"
					}
				}
			}
		])
		await InvoicingReports.remove({_id: reportId})
		return "Moved"
	}

	return 'Success'

}
module.exports = { setReportsNextStatus, paidOrAddPaymentInfo, invoiceSubmission, invoiceReloadFile }