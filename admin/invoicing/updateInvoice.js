const { Invoice } = require('../models')
const { setInvoiceIdToSteps } = require("../invoicingClientReports/helpers")


exports.updateInvoice = async (invoiceId, updateData, ) => {
	try {
		const invoiceBeforeUpdate = await Invoice.findById(invoiceId).lean()
		const oldReportsIds = invoiceBeforeUpdate.items.filter(i => i.type === 'Report').map(({reportId}) => reportId.toString())
		const addReports = updateData.hasOwnProperty('items') ? updateData.items.filter(i => i.type === 'Report' && !oldReportsIds.includes(i.reportId)).map(({reportId}) => reportId) : []
		const deletedReports = oldReportsIds.filter(i => !updateData.items.map(({ reportId }) => reportId).includes(i))

		setInvoiceIdToSteps(addReports, invoiceId)
		setInvoiceIdToSteps(deletedReports, null)

		const invoice = await Invoice.findByIdAndUpdate(invoiceId, updateData)
		return invoice._id
	} catch (e) {
		console.log(e)
	}
}

exports.updateInvoiceItem = async (invoiceId, itemId, updateData) => {
	try {
		const invoice = await Invoice.findByIdAndUpdate(invoiceId, {'items.$[i]': updateData}, {arrayFilters: [{'i._id': itemId}]})
		return invoice._id
	} catch (e) {

	}
}
