const { InvoicingReceivables } = require('../models')
const { returnMessageAndType } = require('./helper')
const { getReportById } = require('./getReceivables')
const { ObjectID: ObjectId } = require("mongodb")

const updateInvoiceReceivablesStatus = async (reportId, status) => {
	await InvoicingReceivables.updateOne({ _id: reportId }, { status })
}


const paidOrAddPaymentInfo = async (reportId, data) => {
	const status = data.unpaidAmount <= 0 ? "Paid" : "Partially Paid"

	await InvoicingReceivables.updateOne({ _id: reportId }, {$set: {status: status}, $push: { paymentInformation: data } })

	// if (true) {
	if ("Paid" === status) {
		const { externalIntegration: { _id: zohoId } } = (await InvoicingReceivables.findOne({ _id: reportId } ))
	  await InvoicingReceivables.aggregate([
			{	"$match": {"_id" : ObjectId(reportId) } },
			{
				"$merge" : {
					"into" : {
						"db" : "pangea",
						"coll" : "invoicingreceivablesarchives"
					}
				}
			}
		])
		await InvoicingReceivables.remove({_id: reportId})
		return {status: "Moved", zohoId }
	}

	return {status: 'Success' }

}

module.exports = {
	updateInvoiceReceivablesStatus,
	paidOrAddPaymentInfo
}