const { Invoice, InvoicingClientReports, Clients, PaymentTerms, Projects } = require("../models")
const { getAmountByPercent } = require("./helpers")
const { updateInvoice } = require("./updateInvoice")
const moment = require("moment")
const { createDir } = require("../utils/folder")
const { getAllSteps } = require("../invoicingClientReports/getReports")
const { createReports } = require("../invoicingClientReports/createReports")
const { sendInvoice } = require("../invoicing/actions")
const { ObjectId } = require("mongodb")
const { setInvoiceIdToSteps } = require("../invoicingClientReports/helpers")
const DIR = './dist/invoice/'

const createInvoice = async (_customerId, _clientBillingInfoId) => {
	try {
		const { billingInfo: billingInfos, accountManager } = await Clients.findById(_customerId, { billingInfo: 1, accountManager: 1 })
		const billingInfo = billingInfos.find(({ _id }) => `${ _id }` === `${ _clientBillingInfoId }`)

		let terms = await PaymentTerms.findOne({ _id: billingInfo.paymentTerms._id })
		if (!terms) terms = await PaymentTerms.findOne({ title: '21 Days' })

		const lastIndex = await Invoice.findOne().sort({ 'invoiceId': -1 }).lean()
		let lastIntIndex = lastIndex != null ? parseInt(lastIndex.invoiceId.split('_').pop()) : 100

		const invoice = await Invoice.create({
			customer: _customerId,
			invoiceId: 'INV_' + (++lastIntIndex + '').padStart(6, "0"),
			clientBillingInfo: _clientBillingInfoId,
			accountManager,
			terms,
			invoicingDate: new Date(),
			dueDate: new Date(moment().add((billingInfo?.paymentTerms?.value || 21), 'days').format('YYYY-MM-DD'))
		})

		await createDir(DIR, invoice._id.toString())
		return invoice._id
	} catch (e) {

	}
}

const createInvoiceItem = async (_invoiceId, item) => {
	try {
		const invoice = await Invoice.findByIdAndUpdate(_invoiceId, { $push: { 'items': item } })
		if (item.hasOwnProperty("reportId")) {
			await InvoicingClientReports.updateOne({ _id: item.reportId }, { invoice: invoice._id })
		}
		return invoice._id
	} catch (e) {
		console.log(e)
	}
}

const createInvoiceFromReport = async ({ _reportId, _customerId, _clientBillingInfoId, item }) => {
	try {
		let { title, quantity, rate, type = 'Report', tax = 0, taxType = 'Percents' } = item
    let amount = rate
		const invoice = await createInvoice(_customerId, _clientBillingInfoId)

		const { billingInfo: billingInfos, accountManager } = await Clients.findById(_customerId, { billingInfo: 1, accountManager: 1 })
		const billingInfo = billingInfos.find(({ _id }) => `${ _id }` === `${ _clientBillingInfoId }`)

		let terms = await PaymentTerms.findOne({ _id: billingInfo.paymentTerms._id })
		if (!terms) terms = await PaymentTerms.findOne({ title: '21 Days' })

		await updateInvoice(invoice._id, {
			$set: {
				accountManager,
				invoicingDate: new Date(),
				terms,
				dueDate: new Date(moment().add((billingInfo?.paymentTerms?.value || 21), 'days').format('YYYY-MM-DD'))
			}
		})

		if (billingInfo.address && billingInfo.address.country === 'Cyprus') {
      tax = 19
			const taxTotal = getAmountByPercent(amount, 19)
      amount = +(amount + taxTotal).toFixed(2)
		}

		await createDir(DIR, invoice._id.toString())
		await createInvoiceItem(invoice._id, { title, quantity, type, rate, tax, taxType, amount, reportId: _reportId })
		return {invoiceId: invoice._id}
	} catch (e) {
		console.log(e)
	}
}

async function createInvoicePipeline(projectId, emails) {
	projectId = typeof projectId === "string" ? ObjectId(projectId) : projectId
	const checkedSteps = await getAllSteps(0, 1000, { "projectId": projectId  })
	const reportInfo = await createReports({ checkedSteps, createdBy: null })

	if (!reportInfo) throw new Error('Cannot create report')
	const { _id, reportId, client, clientBillingInfo, total} = reportInfo
	const item = {title: `Language Service: report ${reportId}`, quantity: 1, rate: +(total).toFixed(2)}
	const {invoiceId} = await createInvoiceFromReport({ _reportId: _id, _customerId: client, _clientBillingInfoId: clientBillingInfo , item  })

	if (!emails.length) throw new Error('Billing info need at least one contact with email')
	setInvoiceIdToSteps([reportInfo._id.toString()], invoiceId.toString())
	await sendInvoice(invoiceId, emails )
}

module.exports = {
	createInvoice,
	createInvoiceItem,
	createInvoiceFromReport,
	createInvoicePipeline,
}
