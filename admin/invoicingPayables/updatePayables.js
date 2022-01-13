const { InvoicingPayables, InvoicingPayablesArchive } = require("../models")
const { moveProjectFile } = require('../utils/movingFile')
const fs = require('fs')
const { getPayable } = require("./getPayables")
const ObjectId = require("mongodb").ObjectID

const setPayablesNextStatus = async (reportsIds, nextStatus) => {
	await InvoicingPayables.updateMany({ _id: { $in: reportsIds } }, { status: nextStatus })
}

const invoiceReloadFile = async ({ reportId, expectedPaymentDate, invoiceFile, oldPath }) => {
	await fs.unlink(`./dist${ oldPath }`, (err) => {
		if (err) console.log("Error in removeOldInvoiceFile")
	})
	return await invoiceSubmission({ reportId, expectedPaymentDate, invoiceFile })
}

const invoiceSubmission = async ({ reportId, invoiceFile }) => {
	const fileName = `${ Math.floor(Math.random() * 1000000) }-${ invoiceFile[0].filename.replace(/( *[^\w\.]+ *)+/g, '_') }`
	const newPath = `/vendorReportsFiles/${ reportId }/${ fileName }`
	await moveProjectFile(invoiceFile[0], `./dist${ newPath }`)

	await InvoicingPayables.updateOne({ _id: reportId }, {
		status: 'Invoice Received',
		'paymentDetails.file': {
			fileName,
			path: newPath
		}
	})
	return newPath
}

const paidOrAddPaymentInfo = async (reportId, zohoPaymentId, data) => {
	const status = data.unpaidAmount <= 0 ? "Paid" : "Partially Paid"

	await InvoicingPayables.updateOne({ _id: reportId }, { $set: { status: status }, $push: { paymentInformation: { ...data, zohoPaymentId } } })

	if ("Paid" === status) {
		await InvoicingPayables.aggregate([
			{ "$match": { "_id": ObjectId(reportId) } },
			{
				"$merge": {
					"into": {
						"db": "pangea",
						"coll": "invoicingpayablesarchives"
					}
				}
			}
		])
		await InvoicingPayables.remove({ _id: reportId })
		return "Moved"
	}

	return 'Success'

}

const updatePayable = async (reportId, obj) => {
	await InvoicingPayables.updateOne({ _id: reportId }, obj)
	return await getPayable(reportId)
}

module.exports = { setPayablesNextStatus, paidOrAddPaymentInfo, invoiceSubmission, invoiceReloadFile, updatePayable }