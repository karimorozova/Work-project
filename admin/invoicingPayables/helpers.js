const { moveProjectFile } = require("../utils/movingFile")
const { getVendorAfterUpdate, getVendor } = require("../vendors")
const { PaymentTerms } = require("../models")

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

const invoiceFileUploading = async (invoiceFile) => {
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

module.exports = {
	clearPayablesStepsPrivateKeys,
	returnMessageAndType,
	invoiceFileUploading,
	getVendorAndCheckPaymentTerms
}