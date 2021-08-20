const { InvoicingReports } = require("../models")


const setReportsNextStatus = async (reportsIds, nextStatus) => {
	await InvoicingReports.updateMany({_id: {$in: reportsIds}}, { status: nextStatus })
}

const paidOrAddPaymentInfo = async (reportId, data) => {

	await InvoicingReports.updateOne({_id: reportId}, {$push: { paymentInformation: data } })

}
module.exports = { setReportsNextStatus, paidOrAddPaymentInfo }