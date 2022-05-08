const { Invoice, Projects } = require('../models')
const { setInvoiceIdToSteps } = require("../invoicingClientReports/helpers")
const { getInvoiceFinance } = require("./helpers")
const { sendQuoteToVendorsAfterProjectAccepted } = require("../utils")
const { getProject } = require("../projects/getProjects")


exports.updateInvoice = async (invoiceId, updateData, updateItems = false) => {
	try {
		if (updateItems) {
			const invoiceBeforeUpdate = await Invoice.findById(invoiceId).lean()
			const oldReportsIds = invoiceBeforeUpdate.items.filter(i => i.type === 'Report').map(({ reportId }) => reportId.toString())
			const addReports = updateData.hasOwnProperty('items') ? updateData.items.filter(i => i.type === 'Report' && !oldReportsIds.includes(i.reportId)).map(({ reportId }) => reportId) : []
			const deletedReports = updateData.hasOwnProperty('items') ? oldReportsIds.filter(i => !updateData.items.map(({ reportId }) => reportId).includes(i)) : []

			setInvoiceIdToSteps(addReports, invoiceId)
			setInvoiceIdToSteps(deletedReports, null)

		}

		const invoice = await Invoice.findByIdAndUpdate(invoiceId, updateData)
		return invoice._id
	} catch (e) {
		console.log(e)
	}
}

exports.payInvoice = async (invoiceId, data = {}) => {
	try {
		const { paymentMethod = null, paymentDate = new Date(), notes = ""} = data
		const invoice = await Invoice.findById(invoiceId).populate('items.reportId', ['stepsAndProjects']).populate('customer', [ 'billingInfo' ]).lean()
		const invoiceFinance = getInvoiceFinance(invoice)
		const paidAmount = data?.paidAmount ? data.paidAmount : invoiceFinance.total
		const unpaidAmount = invoiceFinance.total - paidAmount
		const clientBillingInfo = invoice.customer.billingInfo.find(i => i._id.toString() === invoice.clientBillingInfo.toString())



		if (clientBillingInfo.paymentType === 'PPP') {
			await createPayment(invoiceId, paidAmount, unpaidAmount, paymentMethod, paymentDate, notes )
		}
		if (unpaidAmount === 0) {
			await Invoice.findByIdAndUpdate(invoiceId, {status: "Paid"})
			const projectId = invoice.items[0].reportId.stepsAndProjects[0].project
			const project = await getProject({ "_id": projectId })
			const steps = await sendQuoteToVendorsAfterProjectAccepted(project.steps, project)
			await Projects.findByIdAndUpdate(projectId, { steps, isPaid: true, inPause: false })
		}

	} catch (e) {
		console.log(e)
	}

}
const createPayment = async (invoiceId, total, unpaidAmount, paymentMethod = null, paymentDate = new Date(), notes = "") => {
	return Invoice.findByIdAndUpdate(
			invoiceId,
			{
				paymentInformation:
						{
							paidAmount: total,
							unpaidAmount: unpaidAmount,
							paymentMethod: paymentMethod,
							paymentDate: paymentDate,
							notes: notes
						}
			},
			{ new: true })
}

exports.updateInvoiceItem = async (invoiceId, itemId, updateData) => {
	try {
		const invoice = await Invoice.findByIdAndUpdate(invoiceId, { 'items.$[i]': updateData }, { arrayFilters: [ { 'i._id': itemId } ] })
		return invoice._id
	} catch (e) {

	}
}
