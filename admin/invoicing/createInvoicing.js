const { Invoice, InvoicingClientReports, Clients, PaymentTerms } = require("../models")
const { getAmountByPercent } = require("./helpers")
const { updateInvoice } = require("./updateInvoice")
const moment = require("moment")

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

	}
}

const createInvoiceFromReport = async ({ _reportId, _customerId, _clientBillingInfoId, item }) => {
	try {
		let { title, quantity, rate, type = 'Report', vatPercents = 0, vatAmount = 0, amount = 0 } = item
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
			vatPercents = 19
			vatAmount = getAmountByPercent(rate, 19)
		}
		!!vatAmount ? amount = +(rate + vatAmount).toFixed(2) : amount = rate

		await createInvoiceItem(invoice._id, { title, quantity, type, rate, vatPercents, vatAmount, amount, reportId: _reportId })
	} catch (e) {

	}
}

module.exports = {
	createInvoice,
	createInvoiceItem,
	createInvoiceFromReport
}