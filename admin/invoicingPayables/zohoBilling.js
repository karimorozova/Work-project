const { Zoho } = require("../models")
const axios = require("axios")
const baseUrl = 'https://books.zoho.com/api/v3/'
const organizationId = '630935724'
const FormData = require("form-data")
const path = require("path")
const fs = require("fs")
const { log } = require("nodemon/lib/utils")
const moment = require("moment")
const { returnMessageAndType } = require("./helpers")
const { refreshToken } = require("../services")
const { logging } = require("googleapis/build/src/apis/logging")
const { paidOrAddPaymentInfo } = require("./updatePayables")
const { getPayable, getAllPayables, getAllPayable } = require("./getPayables")
const { updatePayable } = require("./updatePayables")

async function getCurrentToken() {
	try {
		const token = await Zoho.findOne()
		return token.access_token
	} catch (err) {
		console.log(err)
		console.log("Error on getCurrentToken ZOHO from DB")
	}
}

const setNewTokenFromRefresh = async () => {
	try {
		const { _id, refresh_token } = await Zoho.findOne()
		const { access_token = '' } = await refreshToken(refresh_token)
		if (access_token === '') return returnMessageAndType("test", 'error')
		await Zoho.updateOne({ _id: _id }, { access_token })
		return access_token
	} catch (e) {
		return false
	}
}

const zohoRequest = async (link, data, token, method = "GET", header = {}, additional = {}) => {
	return (await axios({
		headers: {
			'Authorization': `Bearer  ${ token }`,
			"Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
			...header
		},
		method,
		url: baseUrl + link,
		data,
		...(additional)
	}))
}

const sendRequestToZoho = async (link, data, method = "GET", header = {}, additional = {}) => {
	let token = await getCurrentToken()
	try {
		return await zohoRequest(link, data, token, method, header, additional)
	} catch (err) {
		console.log(err.response)
		try{
			if (err.response || err.response.data.code === 57) {
				token = await setNewTokenFromRefresh()
				if (!token) return returnMessageAndType('Can`t get access_token', 'error')
				return await	zohoRequest(link, data, token, method, header, additional )
			}
		} catch (err) {
			return returnMessageAndType(err.response.data.message, 'error')
		}


		return returnMessageAndType(err.response.data.message, 'error')
	}
}

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
	const customer = await sendRequestToZoho(`contacts?organization_id=${ organizationId }`, `JSONString=` + JSON.stringify(data), 'Post')
	return customer.data.contact.contact_id
}


const createBill = async (due_date, vendorEmail, billNumber, lineItems, notes) => {
	let zohoVendorId = await getVendor(vendorEmail)
	zohoVendorId = zohoVendorId ? zohoVendorId : await createVendor('test', vendorEmail)
	const data = {
		"vendor_id": zohoVendorId,
		"bill_number": billNumber,
		"due_date": due_date,
		"line_items": lineItems,
		"notes": notes,
	}
	const billing = await sendRequestToZoho(`bills?organization_id=${ organizationId }`, `JSONString=` + JSON.stringify(data), 'Post')
	return billing.data
}

const createNewPayable = async (vendorName, vendorEmail, billId, amount) => {
	let vendorId = await getVendor(vendorEmail)
	vendorId = vendorId ? vendorId : await createVendor('test', vendorEmail)

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
	const { vendorpayment } = (await sendRequestToZoho(`vendorpayments?organization_id=${ organizationId }`, `JSONString=` + JSON.stringify(data), 'Post')).data
	return vendorpayment.payment_id
}

const updatePayablesFromZoho = async () => {
	try {
		let allPayables = (await getAllPayable())
		for (let {_id: reportId, paymentInformation, unpaidAmount, zohoBillingId: zohoId} of allPayables) {
			await syncPayableWithZoho(reportId, { zohoId, paymentInformation, unpaidAmount}  )
		}
		return { type: 'success', message: 'Updated from Zoho', isMovedToArchive: false }
	} catch (err) {
		return {type: 'error', message: err.message, isMovedToArchive: false}
	}

}

const updatePayableFromZoho = async (reportId ) => {
	try {
		let { zohoBillingId: zohoId, paymentInformation, unpaidAmount} = (await getPayable(reportId))[0]
		const statusAction = await syncPayableWithZoho(reportId, { zohoId, paymentInformation, unpaidAmount}  )
		return statusAction === 'Moved' ? { type: 'success',message: 'Updated and moved to Archive', isMovedToArchive: true} : { type: 'success', message: 'Updated from Zoho', isMovedToArchive: false }

	} catch (err) {
		return {type: 'error', message: err.message, isMovedToArchive: false}
	}
}

const syncPayableWithZoho = async (reportId, { zohoId, paymentInformation, unpaidAmount}) => {
	const createdZohoPaidIds =  paymentInformation.reduce((acc, {zohoPaymentId}) => {
			acc.push(zohoPaymentId)
			return acc
	}, [])

	const listBillPayments = (await sendRequestToZoho(`bills/${ zohoId }/payments?organization_id=${ organizationId }`)).data


	for await (let { payment_id, date, amount } of listBillPayments.payments) {
		if(!createdZohoPaidIds.includes(payment_id)) {
			//TODO: https://stackoverflow.com/questions/31426740/how-to-return-many-promises-and-wait-for-them-all-before-doing-other-stuff

			unpaidAmount = (unpaidAmount - amount).toFixed(2)
			await paidOrAddPaymentInfo(reportId,  payment_id,  {paidAmount:amount, unpaidAmount, paymentMethod: 'Test1',	paymentDate: new Date(date), notes: ''})

		}
	}
	if (unpaidAmount <= 0) return "Moved"
	return "Success"
}

const addFile = async (billId, filePath) => {
	const finalPath = path.join('./dist', filePath)
	const form = new FormData()
	form.append('attachment', fs.createReadStream(finalPath))

	const addedFile = await sendRequestToZoho(`bills/${ billId }/attachment?organization_id=${ organizationId }`, form, 'Post', form.getHeaders())
}

const removeFile = async (billId) => {
	await sendRequestToZoho(`bills/${ billId }/attachment?organization_id=${ organizationId }`, [], 'Delete')
}



module.exports = {
	createBill,
	addFile,
	removeFile,
	createNewPayable,
	updatePayableFromZoho,
	updatePayablesFromZoho
}