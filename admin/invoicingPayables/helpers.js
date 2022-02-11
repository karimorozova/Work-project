const { moveProjectFile } = require("../utils/movingFile")
const { getVendorAfterUpdate, getVendor } = require("../vendors")
const { PaymentTerms, InvoicingPayables } = require("../models")
const { ObjectID: ObjectId } = require("mongodb")
const { getPayable } = require("./getPayables")

const clearPayablesStepsPrivateKeys = async (reports) => {
	const privateKeys = [
		'finance',
		'nativeFinance.Price.receivables',
		'refFiles',
		'defaultStepPrice',
		'clientRate',
		'targetFile',
		'vendor',
		'service',
		'memoqDocIds'
	]

	return await reports.map(report => {
		const steps = report.steps.map(step => {
			for (let key of privateKeys) {
				if (!key.includes('.')) {
					delete step[key]
				} else {
					const newKeys = key.split('.')
					switch (newKeys.length) {
						case 2: {
							const [ a, b ] = newKeys
							delete step[a][b]
						}
							break
						case 3: {
							const [ a, b, c ] = newKeys
							delete step[a][b][c]
						}
							break
					}
				}
			}
			return step
		})
		return { ...report, steps }
	})
}

const returnMessageAndType = (message, type) => {
	return {
		type,
		message: message || 'Internal error'
	}
}

const invoiceFileUploading = async (invoiceFile, reportId) => {
	const fileName = `${ Math.floor(Math.random() * 1000000) }-${ invoiceFile.filename.replace(/( *[^\w\.]+ *)+/g, '_') }`
	const newPath = `/vendorReportsFiles/${ reportId }/${ fileName }`
	await moveProjectFile(invoiceFile, `./dist${ newPath }`)
	return { fileName, newPath }
}

const getVendorAndCheckPaymentTerms = async (vendorId) => {
	const vendor = await getVendor({ "_id": vendorId })
	const allPaymentTerms = await PaymentTerms.find()

	if (!vendor.billingInfo.hasOwnProperty('paymentTerm') || !vendor.billingInfo.paymentTerm._id) {
		const { billingInfo } = vendor
		billingInfo.paymentTerm = allPaymentTerms.find(item => item.name === '30 Days') || allPaymentTerms[0]
		return await getVendorAfterUpdate({ "_id": vendorId }, { billingInfo })
	}
	return vendor
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

const updatePayableReport = async (reportId, obj) => {
	await InvoicingPayables.updateOne({ _id: reportId }, obj)
	return await getPayable(reportId)
}

module.exports = {
	clearPayablesStepsPrivateKeys,
	returnMessageAndType,
	invoiceFileUploading,
	getVendorAndCheckPaymentTerms,
	paidOrAddPaymentInfo,
	updatePayableReport
}