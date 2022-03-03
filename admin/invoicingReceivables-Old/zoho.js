const axios = require("axios")
const { Zoho, InvoicingPayables } = require("../models")
const { getAllReportsFromDb } = require('./getReceivables')
const { updateInvoiceReceivablesStatus } = require('./updateReceivables')
const { sendInvoiceToClientContacts } = require('./notification')
const moment = require('moment')
const { InvoicingReceivables } = require('../models')
const { returnMessageAndType } = require('./helper')
const fs = require('fs')
const { ObjectID: ObjectId } = require("mongodb")
const { refreshToken, sendRequestToZoho } = require("../services/zoho")

// const baseUrl = 'https://books.zoho.com/api/v3/'
const organizationId = '630935724'

// async function getCurrentToken() {
// 	try {
// 		const token = await Zoho.findOne()
// 		return token.access_token
// 	} catch (err) {
// 		console.log(err)
// 		console.log("Error on getCurrentToken ZOHO from DB")
// 	}
// }
//
// const sendRequestToZoho = async (link, data, method = "GET", header = {}, additional = {}) => {
// 	let token = await getCurrentToken()
// 	try {
// 		return await zohoRequest(link, data, token, method, header, additional)
// 	} catch (err) {
// 		try{
// 			if (err.response || err.response.data.code === 57) {
// 				token = await setNewTokenFromRefresh()
// 				if (!token) return returnMessageAndType('Can`t get access_token', 'error')
// 				return await	zohoRequest(link, data, token, method, header, additional )
// 			}
// 		} catch (err) {
// 			returnMessageAndType(err.message, 'error')
// 		}
//
// 		returnMessageAndType(err.message, 'error')
// 	}
// }
//
// const zohoRequest = async (link, data, token, method = "GET", header = {}, additional = {}) => {
// 	return (await axios({
// 		headers: {
// 			'Authorization': `Bearer  ${ token }`,
// 			"Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
// 			...header
// 		},
// 		method,
// 		url: baseUrl + link,
// 		data,
// 		...(additional)
// 	}))
// }

const getCustomer = async (companyName) => {
	const customer = await sendRequestToZoho(`contacts?organization_id=${ organizationId }&company_name=${ companyName }`)
	return customer.data.contacts.length > 0 ? customer.data.contacts[0].contact_id : "335260000005073023"
}

const setNewTokenFromRefresh = async (attempt) => {
	if (attempt >= 5) return false
	try {
		const { _id, refresh_token } = await Zoho.findOne()
		const { access_token = '' } = await refreshToken(refresh_token)
		if (access_token === '') return returnMessageAndType("test", 'error')
		await Zoho.updateOne({ _id: _id }, { access_token })
		return true
	} catch (e) {
		return false
	}
}

const createAndSendZohoInvoice = async (_reportId) => {
	const data = await getZohoInvoiceCreationStructure(_reportId)
	try {
		const result = await sendRequestToZoho(`invoices?organization_id=${ organizationId }`, `JSONString=` + JSON.stringify(data), "POST")
		const { invoice: { invoice_id: _id, invoice_number: reportId } } = result.data
		await saveInvoiceFile(_reportId, _id)
		{
			await InvoicingReceivables.updateOne({ _id: _reportId }, { externalIntegration: { _id, reportId } })
			await updateInvoiceReceivablesStatus(_reportId, 'Sent')
			await setInvoiceStatus(_id, 'sent')
			await sendInvoiceToClientContacts(_reportId)
		}
		return returnMessageAndType(result.data.message, 'success')
	} catch (err) {
		console.log(err)
		return returnMessageAndType(err.response.data.message, 'error')
	}
}

const createZohoInvoice = async (_reportId, attempt = 1) => {
	const data = await getZohoInvoiceCreationStructure(_reportId)
	try {
		const result = await sendRequestToZoho(`invoices?organization_id=${ organizationId }`, `JSONString=` + JSON.stringify(data), "POST")
		const { invoice: { invoice_id: _id, invoice_number: reportId } } = result.data
		await saveInvoiceFile(_reportId, _id)

		{
			await InvoicingReceivables.updateOne({ _id: _reportId }, { externalIntegration: { _id, reportId } })
			await updateInvoiceReceivablesStatus(_reportId, 'Invoice Ready')
		}
		return returnMessageAndType(result.data.message, 'success')
	} catch (err) {
		console.log(err)
		if (err.response.data && err.response.data.code === 57) {
			const isUpdated = await setNewTokenFromRefresh(attempt)
			if (!isUpdated) return returnMessageAndType('Can`t get access_token', 'error')
			return await createZohoInvoice(_reportId, ++attempt)
		}

		return returnMessageAndType(err.response.data.message, 'error')
	}
}

const deleteZohoInvoice = async (invoiceId) => {
	try {
		await sendRequestToZoho(`invoices/${ invoiceId }?organization_id=${ organizationId }`, '', 'DELETE')
	} catch (e) {
	}
}

const getZohoInvoiceCreationStructure = async (_reportId) => {
	const [ report ] = await getAllReportsFromDb(0, 1, { _id: ObjectId(_reportId) })
	const { client, clientBillingInfo, total, reportId, lastPaymentDate } = report
	const getOfficialCompanyName = (billingId) => client.billingInfo.find(({ _id }) => `${ _id }` === `${ billingId }`).officialName
	// const customerId = await getCustomer(getOfficialCompanyName(clientBillingInfo))
	const customerId = "335260000005073023"
	return {
		"customer_id": customerId,
		"line_items": [ {
			"item_id": "335260000005073056",
			"rate": total,
			"quantity": 1
		} ]
	}
}

const getZohoClientPaymentCreationStructure = async (_reportId, amount) => {
	const [ report ] = await getAllReportsFromDb(0, 1, { _id: ObjectId(_reportId) })
	const { client, clientBillingInfo, externalIntegration } = report
	const getOfficialCompanyName = (billingId) => client.billingInfo.find(({ _id }) => `${ _id }` === `${ billingId }`).officialName
	const customerId = "335260000005073023"
	return {
		"customer_id": customerId,
		"invoices": [
			{
				"invoice_id": externalIntegration._id.toString(),
				"amount_applied": amount
			}
		],
		"payment_mode": "cash",
		"date": moment().format('YYYY-MM-DD'),
		"amount": amount
	}
}

const saveInvoiceFile = async (_reportId, _zohoId) => {
	const fileName = `${ Math.floor(Math.random() * 1000000) }-invoice.pdf`
	const fileResult = await sendRequestToZoho(`invoices/${ _zohoId }?organization_id=${ organizationId }&accept=pdf`, '', 'GET', {}, { responseType: 'stream' })
	fileResult.data.pipe(fs.createWriteStream(`dist/clientReportsFiles/${ _reportId }/${ fileName }`))
	await InvoicingReceivables.updateOne({ _id: _reportId }, { invoice: { filename: fileName, path: `clientReportsFiles/${ _reportId }/${ fileName }` } })

}

const setInvoiceStatus = async (_zohoId, status) => {
	try {
		await sendRequestToZoho(`invoices/${ _zohoId }/status/${ status }?organization_id=${ organizationId }`, '', 'POST')
	} catch (err) {
		return returnMessageAndType(err.response.data.message, 'error')
	}
}

const createCustomerPayment = async (_reportId, amount) => {
	try {
		const data = await getZohoClientPaymentCreationStructure(_reportId, amount)
		await sendRequestToZoho(`customerpayments?organization_id=${ organizationId }`, `JSONString=` + JSON.stringify(data), "POST")
	} catch (err) {
		console.log(err)
		return returnMessageAndType(err.response.data.message, 'error')
	}
}

// const writeFile = async (path, data) => {
// 	return new Promise((resolve, reject) => {
// 		fs.writeFile(path, data, 'utf8', (err) => {
// 			if (err) reject(err)
// 			else {
// 				resolve()
// 			}
// 		})
// 	})
// }

const updateReportsStateFromZoho = async () => {
	try {
		const reportsFromZoho = await sendRequestToZoho(`invoices?organization_id=${ organizationId }`)
		let reportsFromSystem = (await InvoicingReceivables.find({ $nor: [ { status: 'Created' }, { status: 'Invoice Ready' } ] })).filter(item => !!item.externalIntegration.reportId)
		const { data: { invoices } } = reportsFromZoho

		for await (let report of reportsFromSystem) {
			const _invoiceIdx = invoices.findIndex(({ invoice_id }) => invoice_id === report.externalIntegration._id)

			if (_invoiceIdx !== -1) {
				// TODO: ДИМА ОБНОВЛЯЕТ ВСЕ ЧТО НУЖНО: Статус, финансы, и тд ...

				// const isAllPaid = false
				const isAllPaid = invoices[_invoiceIdx]["payment_made"] === invoices[_invoiceIdx].total
				const paymentInfo = {
					paymentDate: new Date(),
					notes: "",
					paidAmount: invoices[_invoiceIdx]["payment_made"],
					unpaidAmount: invoices[_invoiceIdx].balance,
					paymentMethod: ""
				}

				const dataToUpdate = {
					status: invoices[_invoiceIdx].status,
					paymentInformation: isAllPaid ? [ paymentInfo ] : []
				}
				await InvoicingReceivables.updateOne({ _id: report._id }, { ...dataToUpdate })

				if (isAllPaid) {
					await InvoicingReceivables.aggregate([
						{ "$match": { "_id": ObjectId(report._id) } },
						{
							"$merge": {
								"into": {
									"db": "pangea",
									"coll": "invoicingreceivablesarchives"
								}
							}
						}
					])
					await InvoicingReceivables.remove({ _id: report._id })
					// return returnMessageAndType('Inv', 'error')
				}
			}
		}
		return returnMessageAndType('Information updated', 'success')
	} catch (err) {
		console.log(err)
		return returnMessageAndType(err.response.data.message, 'error')
	}
}

const updateReportStateFromZoho = async (_reportId) => {
	try {
		const [ report ] = await getAllReportsFromDb(0, 1, { _id: ObjectId(_reportId) })
		const { externalIntegration, status } = report
		if (status === 'Created' || status === 'Invoice Ready' || status === "Partly Paid") return returnMessageAndType('Updated', 'success')
		if (externalIntegration._id) {
			const reportFromZoho = await sendRequestToZoho(`invoices/${ externalIntegration._id }?organization_id=${ organizationId }`)
			const { data: { invoice } } = reportFromZoho
			// const isAllPaid = false
			const isAllPaid = invoice["payment_made"] === invoice.total
			// TODO: ДИМА ОБНОВЛЯЕТ ВСЕ ЧТО НУЖНО: Статус, финансы, и тд ...
			const paymentInfo = {
				paymentDate: new Date(),
				notes: "",
				paidAmount: invoice["payment_made"],
				unpaidAmount: invoice.balance,
				paymentMethod: ""
			}

			const dataToUpdate = {
				status: invoice.status,
				paymentInformation: isAllPaid ? [ paymentInfo ] : []
			}

			await InvoicingReceivables.updateOne({ _id: report._id }, { ...dataToUpdate })

			if (isAllPaid) {
				await InvoicingReceivables.aggregate([
					{ "$match": { "_id": ObjectId(_reportId) } },
					{
						"$merge": {
							"into": {
								"db": "pangea",
								"coll": "invoicingreceivablesarchives"
							}
						}
					}
				])
				await InvoicingReceivables.remove({ _id: _reportId })
				// admin/invoicingReceivables/zoho.js:430 hard code "invoice paid"
				return returnMessageAndType('Invoice paid', 'success')
			}
		}
	} catch (err) {
		return returnMessageAndType(err.response.data.message, 'error')
	}
}

module.exports = {
	updateReportStateFromZoho,
	setInvoiceStatus,
	updateReportsStateFromZoho,
	createZohoInvoice,
	createAndSendZohoInvoice,
	deleteZohoInvoice,
	createCustomerPayment
}
