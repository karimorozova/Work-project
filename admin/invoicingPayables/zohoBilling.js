const { Zoho } = require("../models")
const axios = require("axios")
const baseUrl = 'https://books.zoho.com/api/v3/'
const organizationId = '630935724'
const FormData = require("form-data")
const path = require("path")
const fs = require("fs")
const moment = require("moment")
const { returnMessageAndType } = require("./helpers")
const { refreshToken } = require("../services")
const { logging } = require("googleapis/build/src/apis/logging")
const { paidOrAddPaymentInfo } = require("./helpers")
const { getPayable, getAllPayableByDefaultQuery, getAllPayable } = require("./getPayables")
const { sendRequestToZoho } = require("../services/zoho")


const getVendor = async (vendorEmail) => {
	const customer = await sendRequestToZoho(`contacts?organization_id=${ organizationId }&email_startswith=${ vendorEmail }&contact_type=vendor`)
	return customer.data.contacts.length
			? customer.data.contacts[0].contact_id
			: null
}

const createVendor = async (vendorName, vendorEmail) => {
	const data = {
		"contact_name": vendorName,
		"contact_type": "vendor",
		"contact_persons": [
			{
				"email": vendorEmail
			}
		]
	}
	const customer = await sendRequestToZoho(`contacts?organization_id=${ organizationId }`, `JSONString=` + JSON.stringify(data), 'POST')
	return customer.data.contact.contact_id
}

const createBillZohoRequest = async (due_date, vendorName = 'RENAME!!!', vendorEmail, billNumber, lineItems) => {
	let zohoVendorId = await getVendor(vendorEmail)
	if (!zohoVendorId || !vendorEmail) return ''
	// zohoVendorId = zohoVendorId ? zohoVendorId : await createVendor(vendorName, vendorEmail)
	const data = {
		"vendor_id": zohoVendorId,
		"bill_number": billNumber,
		"due_date": due_date,
		"line_items": lineItems
	}
	const billing = await sendRequestToZoho(`bills?organization_id=${ organizationId }`, `JSONString=` + JSON.stringify(data), 'POST')
	return billing.data
}

const createNewPayable = async (vendorName = 'RENAME!!!', vendorEmail, billId, amount) => {
	let vendorId = await getVendor(vendorEmail)
	if (!vendorId || !vendorEmail) return ''
	// vendorId = vendorId ? vendorId : await createVendor(vendorName, vendorEmail)

	const data = {
		"vendor_id": vendorId,
		"bills": [
			{
				"bill_id": billId,
				"amount_applied": amount
			}
		],
		"date": moment().format('YYYY-MM-DD'),
		"amount": amount
	}
	const { vendorpayment } = (await sendRequestToZoho(`vendorpayments?organization_id=${ organizationId }`, `JSONString=` + JSON.stringify(data), 'POST')).data
	return vendorpayment.payment_id
}

const updatePayablesFromZoho = async () => {
	// TODO soon...
	// try {
	// 	let allPayables = (await getAllPayableByDefaultQuery({ zohoBillingId: { $ne: '' } }))
	// 	for (let { _id: reportId, paymentInformation, unpaidAmount, zohoBillingId: zohoId, paymentDetails: { paymentMethod } } of allPayables) {
	// 		await syncPayableWithZoho(reportId, paymentMethod, { zohoId, paymentInformation, unpaidAmount })
	// 	}
	// 	return { type: 'success', message: 'Updated from Zoho', isMovedToArchive: false }
	// } catch (err) {
	// 	return { type: 'error', message: err.message, isMovedToArchive: false }
	// }
}

const updatePayableFromZoho = async (reportId) => {
	try {
		let { zohoBillingId: zohoId, paymentInformation, unpaidAmount, paymentDetails: { paymentMethod } } = (await getPayable(reportId))[0]
		const statusAction = await syncPayableWithZoho(reportId, paymentMethod, { zohoId, paymentInformation, unpaidAmount })
		return statusAction === 'Moved'
				? {
					type: 'success',
					message: 'Updated and moved to Archive',
					isMovedToArchive: true
				}
				: {
					type: 'success',
					message: 'Updated from Zoho',
					isMovedToArchive: false
				}
	} catch (err) {
		return { type: 'error', message: err.message, isMovedToArchive: false }
	}
}

const syncPayableWithZoho = async (reportId, reportPaymentMethod, { zohoId, paymentInformation, unpaidAmount }) => {
	const createdZohoPaidIds = paymentInformation.reduce((acc, { zohoPaymentId }) => {
		acc.push(zohoPaymentId)
		return acc
	}, [])
	const listBillPayments = (await sendRequestToZoho(`bills/${ zohoId }/payments?organization_id=${ organizationId }`)).data

	for await (let { payment_id, date, amount } of listBillPayments.payments) {
		if (!createdZohoPaidIds.includes(payment_id)) {
			unpaidAmount = (unpaidAmount - amount).toFixed(2)
			await paidOrAddPaymentInfo(reportId, payment_id, { paidAmount: amount, unpaidAmount, paymentMethod: reportPaymentMethod, paymentDate: new Date(date), notes: '' })
		}
	}
	if (unpaidAmount <= 0) return "Moved"
	return "Success"
}

const addFile = async (billId, filePath) => {
	const finalPath = path.join('./dist', filePath)
	const form = new FormData()
	form.append('attachment', fs.createReadStream(finalPath))
	await sendRequestToZoho(`bills/${ billId }/attachment?organization_id=${ organizationId }`, form, 'POST', form.getHeaders())
}

const deleteBill = async (billId) => {
	await sendRequestToZoho(`bills/${ billId }?organization_id=${ organizationId }`)
}

const deleteBillWithPayments = async (billId) => {
	await sendRequestToZoho(`bills/${ billId }?organization_id=${ organizationId }`)
}

const setVendorStatusToActive = async (contact_id) => {
	await sendRequestToZoho(`/contacts/${contact_id}/active?organization_id=${ organizationId }`)
}

const removeFile = async (billId) => {
	await sendRequestToZoho(`bills/${ billId }/attachment?organization_id=${ organizationId }`, [], 'Delete')
}


module.exports = {
	createBillZohoRequest,
	addFile,
	removeFile,
	createNewPayable,
	updatePayableFromZoho,
	updatePayablesFromZoho
}