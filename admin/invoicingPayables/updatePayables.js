const { InvoicingPayables, InvoicingPayablesArchive } = require("../models")
const fs = require('fs')
const { getPayable, getPayableByVendorId } = require("./getPayables")

const {
	removeFile,
	addFile,
	createBillZohoRequest
} = require("./zohoBilling")

const moment = require("moment")
const {
	invoiceFileUploading,
	getVendorAndCheckPaymentTerms, updatePayableReport
} = require("./helpers")
const ObjectId = require("mongodb").ObjectID

const setPayablesNextStatus = async (reportsIds, nextStatus) => {
	await InvoicingPayables.updateMany({ _id: { $in: reportsIds } }, { status: nextStatus })
}
const invoiceReloadFile = async ({ reportId, invoiceFile, oldPath }) => {
	await fs.unlink(`./dist${ oldPath }`, (err) => {
		if (err) console.log("Error in removeOldInvoiceFile")
	})
	const { newPath } = await invoiceFileUploading(invoiceFile[0], reportId)
	const { status, zohoBillingId } = await InvoicingPayables.findOneAndUpdate({ _id: reportId }, {
		'paymentDetails.file': { fileName, path: newPath }
	})
	if (status === 'Invoice Ready') {
		await removeFile(zohoBillingId)
		await addFile(zohoBillingId, newPath)
	}
}

const zohoBillCreation = async (_id) => {
	const [ { vendor, reportId: billNumber, lastPaymentDate, paymentDetails: { expectedPaymentDate, file: { path } }, steps } ] = await getPayable(_id)
	const vendorName = vendor.firstName + ' ' + vendor.surname
	const monthAndYear = moment(lastPaymentDate).format("MMMM YYYY")

	const rate = steps.reduce((acc, { nativeFinance }) => {
		acc += nativeFinance.Price.payables
		return acc
	}, 0)

	const lineItems = [ {
		"name": `TS ${ monthAndYear }`,
		"account_id": "335260000002330131",
		"rate": rate,
		"quantity": 1
	} ]
	const { bill } = await createBillZohoRequest(expectedPaymentDate, vendorName, vendor.email, billNumber, lineItems)
	const zohoBillingId = bill.bill_id
	await updatePayableReport(_id, { zohoBillingId })
	await addFile(zohoBillingId, path)
}


const invoiceSubmission = async ({ reportId, vendorId, invoiceFile, paymentMethod }) => {
	const vendorReports = await getPayableByVendorId(vendorId).filter(({ status }) => status === 'Invoice on-hold')
	const [ { paymentDetails, totalPrice } ] = await getPayable(reportId)

	const vendor = await getVendorAndCheckPaymentTerms(vendorId)
	const { fileName, newPath: path } = await invoiceFileUploading(invoiceFile[0], reportId)

	paymentDetails.paymentMethod = typeof paymentMethod === 'string'
			? JSON.parse(paymentMethod)
			: paymentMethod
	paymentDetails.expectedPaymentDate = new Date(moment().add(vendor.billingInfo.paymentTerm.value, 'days').format('YYYY-MM-DD'))
	paymentDetails.file = { fileName, path }


	switch (true) {
		case (!vendorReports.length && paymentMethod.minimumAmount > totalPrice): {
			console.log(vendorReports.length, paymentMethod.minimumAmount, totalPrice)
		}

	}


	// console.log(reportId, vendorId, invoiceFile, paymentMethod)

	//TODO HOLD CHECK

	// await InvoicingPayables.updateOne(
	// 		{ _id: reportId },
	// 		{ status: 'SOON ASDASDASD', 'paymentDetails.file': { } }
	// )
}


module.exports = {
	setPayablesNextStatus,
	invoiceSubmission,
	invoiceReloadFile
}