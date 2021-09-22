const axios = require("axios")
const { Zoho } = require("../models")
const { getReportById } = require('./getReceivables')
const { updateInvoiceReceivablesStatus, sendInvoiceToClientContacts } = require('./updateReceivables')
const moment = require('moment')
const { InvoicingReceivables } = require('../models')
const { getTokens } = require('../services')
const { returnMessageAndType } = require('./helper')
const fs = require('fs')


const baseUrl = 'https://books.zoho.com/api/v3/'
const organizationId = '630935724'

async function getCurrentToken() {
	try {
		const token = await Zoho.findOne()
		return token.access_token
	} catch (err) {
		console.log(err)
		console.log("Error on getCurrentToken ZOHO from DB")
	}
}


const zohoRequest = async (link, data, method = "GET") => {
	// try {
	const token = await getCurrentToken()
	return (await axios({
		headers: {
			'Authorization': `Bearer  ${ token }`,
			"Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
		},
		method,
		url: baseUrl + link,
		data
	}))
	// } catch (e) {
	// 	console.log(e)
	// }
}

const getCustomer = async (companyName) => {
	const customer = await zohoRequest(`contacts?organization_id=${ organizationId }&contact_name=${ companyName }`)
	return customer.data.contacts[0].contact_id
}

const createAndSendZohoInvoice = async (_reportId) => {
	const data = await getZohoInvoiceCreationStructure(_reportId)

	try {
		// const result = await zohoRequest(`invoices?organization_id=${ organizationId }`, `JSONString=` + JSON.stringify(data), "POST")
		console.log('SAVE FILES + SEND')
		{
		// 	const { invoice: { invoice_id: _id, invoice_number: reportId } } = result.data
		// 	await InvoicingReceivables.updateOne({ _id: _reportId }, { externalIntegration: { _id, reportId } })
		// 	await updateInvoiceReceivablesStatus(_reportId, 'Send')
			await sendInvoiceToClientContacts(_reportId)
		}

		return returnMessageAndType(result.data.message, 'success')
	} catch (err) {
		return returnMessageAndType(err.response.data.message, 'error')
	}
}

const createZohoInvoice = async (_reportId) => {
	const data = await getZohoInvoiceCreationStructure(_reportId)

	try {
		const result = await zohoRequest(`invoices?organization_id=${ organizationId }`, `JSONString=` + JSON.stringify(data), "POST")
		const { invoice: { invoice_id: _id, invoice_number: reportId } } = result.data
		const fileResult = (await zohoRequest(`invoices/${ _id }?organization_id=${ organizationId }&accept=pdf`))
		fileResult.pipe( fs.createWriteStream("file.pdf"))
		console.log(fileResult)
		{
			await InvoicingReceivables.updateOne({ _id: _reportId }, { externalIntegration: { _id, reportId } })
			// await updateInvoiceReceivablesStatus(_reportId, 'Invoice Ready')
		}
		return returnMessageAndType(result.data.message, 'success')
	} catch (err) {
		return returnMessageAndType(err.response.data.message, 'error')
	}
}

const getZohoInvoiceCreationStructure = async (_reportId) => {
	const [ report ] = await getReportById(_reportId)
	const { client, clientBillingInfo, total, reportId, lastPaymentDate } = report
	const getOfficialCompanyName = (billingId) => client.billingInfo.find(({ _id }) => `${ _id }` === `${ billingId }`).officialName

	return {
		"customer_id": "335260000005073023",
		"line_items": [ {
			"item_id": "335260000005073056",
			"rate": total,
			"quantity": 1
		} ]
	}
}


module.exports = {
	createZohoInvoice,
	createAndSendZohoInvoice
}
