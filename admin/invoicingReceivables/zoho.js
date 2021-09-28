const axios = require("axios")
const { Zoho, InvoicingPayables } = require("../models")
const { getReportById } = require('./getReceivables')
const { updateInvoiceReceivablesStatus } = require('./updateReceivables')
const { sendInvoiceToClientContacts } = require('./notification')
const moment = require('moment')
const { InvoicingReceivables } = require('../models')
const { getTokens, refreshToken } = require('../services')
const { returnMessageAndType } = require('./helper')
const fs = require('fs')
const { ObjectID: ObjectId } = require("mongodb")

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


const zohoRequest = async (link, data, method = "GET", additional = {}) => {
	const token = await getCurrentToken()
	return (await axios({
		headers: {
			'Authorization': `Bearer  ${ token }`,
			"Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
		},
		method,
		url: baseUrl + link,
		data,
		...(additional)
	}))
}

const getCustomer = async (companyName) => {
	const customer = await zohoRequest(`contacts?organization_id=${ organizationId }&contact_name=${ companyName }`)
	return customer.data.contacts[0].contact_id
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
		const result = await zohoRequest(`invoices?organization_id=${ organizationId }`, `JSONString=` + JSON.stringify(data), "POST")
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
		return returnMessageAndType(err.response.data.message, 'error')
	}
}

const createZohoInvoice = async (_reportId, attempt = 1) => {
	const data = await getZohoInvoiceCreationStructure(_reportId)
	try {
		const result = await zohoRequest(`invoices?organization_id=${ organizationId }`, `JSONString=` + JSON.stringify(data), "POST")
		const { invoice: { invoice_id: _id, invoice_number: reportId } } = result.data
		await saveInvoiceFile(_reportId, _id)

		{
			await InvoicingReceivables.updateOne({ _id: _reportId }, { externalIntegration: { _id, reportId } })
			await updateInvoiceReceivablesStatus(_reportId, 'Invoice Ready')
		}
		return returnMessageAndType(result.data.message, 'success')
	} catch (err) {
		if (err.response.data.code === 57) {
			const isUpdated = await setNewTokenFromRefresh(attempt)
			if (!isUpdated) return returnMessageAndType('Can`t get access_token', 'error')
			return await createZohoInvoice(_reportId, ++attempt)
		}

		return returnMessageAndType(err.response.data.message, 'error')
	}
}

const deleteZohoInvoice = async (invoiceId) => {
	try {
		await zohoRequest(`invoices/${ invoiceId }?organization_id=${ organizationId }`, '', 'DELETE')
	} catch (e) {
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

const saveInvoiceFile = async (_reportId, _zohoId) => {
	const fileName = `${ Math.floor(Math.random() * 1000000) }-invoice.pdf`

	const fileResult = await zohoRequest(`invoices/${ _zohoId }?organization_id=${ organizationId }&accept=pdf`, '', 'GET', { responseType: 'stream' })
	fileResult.data.pipe(fs.createWriteStream(`dist/clientReportsFiles/${ _reportId }/${ fileName }`))
	await InvoicingReceivables.updateOne({ _id: _reportId }, { invoice: { filename: fileName, path: `clientReportsFiles/${ _reportId }/${ fileName }` } })

}

const setInvoiceStatus = async (_zohoId, status) => {
	try {
		await zohoRequest(`invoices/${ _zohoId }/status/${ status }?organization_id=${ organizationId }`, '', 'POST')
	} catch (err) {
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
		const reportsFromZoho = await zohoRequest(`invoices?organization_id=${ organizationId }`)
		let reportsFromSystem = (await InvoicingReceivables.find({ $nor: [ { status: 'Created' }, { status: 'Invoice Ready' } ] })).filter(item => !!item.externalIntegration.reportId)
		const { data: { invoices } } = reportsFromZoho

		for await (let report of reportsFromSystem) {
			const _invoiceIdx = invoices.findIndex(({ invoice_id }) => invoice_id === report.externalIntegration._id)

			if (_invoiceIdx !== -1) {
			 // TODO: ДИМА ОБНОВЛЯЕТ ВСЕ ЧТО НУЖНО: Статус, финансы, и тд ...

				// const isAllPaid = true
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
					paymentInformation : isAllPaid ? [paymentInfo] : []
				}
				await InvoicingReceivables.updateOne({ _id: report._id }, { ...dataToUpdate })

				if (isAllPaid) {
					await InvoicingReceivables.aggregate([
						{	"$match": {"_id" : ObjectId(report._id) } },
						{
							"$merge" : {
								"into" : {
									"db" : "pangea",
									"coll" : "invoicingreceivablesarchives"
								}
							}
						}
					])
					await InvoicingReceivables.remove({_id: report._id})
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
		const [ report ] = await getReportById(_reportId)
		const { externalIntegration } = report
		if (externalIntegration._id) {
			const reportFromZoho = await zohoRequest(`invoices/${ externalIntegration._id }?organization_id=${ organizationId }`)
			const { data: { invoice } } = reportFromZoho
			const isAllPaid = true
			// const isAllPaid = invoice["payment_made"] === invoice.total
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
				paymentInformation : isAllPaid ? [paymentInfo] : []
			}

			await InvoicingReceivables.updateOne({ _id: report._id }, { ...dataToUpdate })

			if (isAllPaid) {
				await InvoicingReceivables.aggregate([
					{	"$match": {"_id" : ObjectId(_reportId) } },
					{
						"$merge" : {
							"into" : {
								"db" : "pangea",
								"coll" : "invoicingreceivablesarchives"
							}
						}
					}
				])
				await InvoicingReceivables.remove({_id: _reportId})
				// admin/invoicingReceivables/zoho.js:430 hard code "invoice paid"
				return returnMessageAndType('Invoice paid', 'success')
			}
		}

	} catch (err) {
		console.log(err)
		return returnMessageAndType(err.response.data.message, 'error')
	}
}

module.exports = {
	updateReportStateFromZoho,
	setInvoiceStatus,
	updateReportsStateFromZoho,
	createZohoInvoice,
	createAndSendZohoInvoice,
	deleteZohoInvoice
}
