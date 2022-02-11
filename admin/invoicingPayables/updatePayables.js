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

const invoiceSubmission = async ({ reportId, vendorId, invoiceFile, paymentMethod }) => {
	//TODO Проверка API  на работоспособность

	let vendorReportsAll = await getPayableByVendorId(vendorId)

	const [ { paymentDetails, totalPrice } ] = await getPayable(reportId)

	const vendor = await getVendorAndCheckPaymentTerms(vendorId)
	const { fileName, newPath: path } = await invoiceFileUploading(invoiceFile[0], reportId)

	paymentDetails.paymentMethod = typeof paymentMethod === 'string'
			? JSON.parse(paymentMethod)
			: paymentMethod
	paymentDetails.expectedPaymentDate = new Date(moment().add(vendor.billingInfo.paymentTerm.value, 'days').format('YYYY-MM-DD'))
	paymentDetails.file = { fileName, path }


	let vendorReports = vendorReportsAll.filter(({ status, _id, paymentDetails: paymentDetailsReport }) =>
			status === 'Invoice on-hold' && `${ reportId }` !== `${ _id }` && paymentDetailsReport.paymentMethod.type === paymentDetails.paymentMethod.type)

	switch (true) {
		case (!vendorReports.length && paymentDetails.paymentMethod.minimumAmount > +totalPrice):
		case (vendorReports.length && (holdReportsSum(vendorReports) + +totalPrice) < paymentDetails.paymentMethod.minimumAmount): {
			await updatePayableReport(reportId, { status: 'Invoice on-hold', paymentDetails })
			console.log('set to HOLD')
			break
		}
		case (!vendorReports.length && paymentDetails.paymentMethod.minimumAmount <= +totalPrice): {
			await updatePayableReport(reportId, { status: 'Invoice Ready', paymentDetails })
			// await zohoBillCreation(reportId)
			console.log('set to Ready generate Bill')
			break
		}
		case (vendorReports.length && (holdReportsSum(vendorReports) + +totalPrice) > paymentDetails.paymentMethod.minimumAmount): {
			await updatePayableReport(reportId, { paymentDetails })
			for await (let id of [ reportId, ...vendorReports.map(({ _id }) => _id.toString()) ]) {
				await updatePayableReport(id, { status: 'Invoice Ready' })
			}
			break
		}
	}


	// console.log(reportId, vendorId, invoiceFile, paymentMethod)

	//TODO HOLD CHECK

	// await InvoicingPayables.updateOne(
	// 		{ _id: reportId },
	// 		{ status: 'SOON ASDASDASD', 'paymentDetails.file': { } }
	// )
	function holdReportsSum(arr) {
		return arr.reduce((acc, curr) => acc + +curr.totalPrice, 0)
	}

	throw new Error('asd')
}

const zohoBillCreation = async (_id) => {
	const [ { vendor, reportId: billNumber, totalPrice, lastPaymentDate, paymentDetails: { expectedPaymentDate, file: { path } } } ] = await getPayable(_id)
	const vendorName = vendor.firstName + ' ' + vendor.surname
	const monthAndYear = moment(lastPaymentDate).format("MMMM YYYY")

	const lineItems = [ {
		"name": `TS ${ monthAndYear }`,
		"account_id": "335260000002330131",
		"rate": totalPrice,
		"quantity": 1
	} ]

	const { bill } = await createBillZohoRequest(expectedPaymentDate, vendorName, vendor.email, billNumber, lineItems)
	const zohoBillingId = bill.bill_id
	await updatePayableReport(_id, { zohoBillingId })
	await addFile(zohoBillingId, path)
}

module.exports = {
	setPayablesNextStatus,
	invoiceSubmission,
	invoiceReloadFile
}