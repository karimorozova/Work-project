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

const zohoRequest = async (link, data, token, method = "GET", header = {}, additional = {}, ) => {
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

const sendRequestToZoho = async (link, data, method = "GET", header = {}, additional = {}, ) => {
	let token = await getCurrentToken()
	try {
		 return await	zohoRequest(link, data, token, method, header, additional )
	} catch (err) {
		if (err.response.data.code === 57) {
			token = await setNewTokenFromRefresh()
			if (!token) return returnMessageAndType('Can`t get access_token', 'error')
			return await	zohoRequest(link, data, token, method, header, additional )
		}

		return returnMessageAndType(err.response.data.message, 'error')
	}
}

const getVendor = async (vendorEmail) => {
	const customer = await sendRequestToZoho(`contacts?organization_id=${organizationId}&email_startswith=${vendorEmail}&contact_type=vendor`)
	return customer.data.contacts[0].contact_id
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
	const customer = await sendRequestToZoho(`contacts?organization_id=${organizationId}`, data, 'Post')
	return customer.data.contact.contact_id
}


const createBill = async (vendorEmail, billNumber, lineItems) => {
	let vendorId = await getVendor(vendorEmail)
	vendorId = vendorId ? vendorId : await createVendor('test' , vendorEmail)

	const data = {
		"vendor_id": vendorId,
		"bill_number": billNumber,
		// "date": "2022-01-05",
		// "due_date": "2022-01-08",
		"line_items": lineItems
		// "line_items": [{
		// 	"account_id": "335260000002330131",
		// 	"rate": rate,
		// 	"quantity": quantity
		// }]
	}
	const billing = await sendRequestToZoho(`bills?organization_id=${organizationId}`, `JSONString=` + JSON.stringify(data), 'Post')
	return billing.data
}

const createNewPayable = async (vendorName, vendorEmail, billId, amount) => {
	let vendorId = await getVendor(vendorEmail)
	vendorId = vendorId ? vendorId : await createVendor('test' , vendorEmail)

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
	await sendRequestToZoho(`vendorpayments?organization_id=${organizationId}`, `JSONString=` + JSON.stringify(data), 'Post')
}

const addFile = async ( billId, filePath) => {
	const finalPath = path.join('./dist', filePath)
	const form = new FormData();
	form.append('attachment', fs.createReadStream(finalPath));

	const addedFile = await sendRequestToZoho(`bills/${billId}/attachment?organization_id=${organizationId}`, form,'Post', form.getHeaders())
}

const removeFile = async ( billId) => {
	await sendRequestToZoho(`bills/${billId}/attachment?organization_id=${organizationId}`, [], 'Delete' )
}

module.exports = {
	createBill,
	addFile,
	removeFile,
	createNewPayable
}