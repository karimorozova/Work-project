const { InvoicingReports } = require("../models")


const setReportsNextStatus = async (reportsIds, nextStatus) => {
	await InvoicingReports.updateMany({_id: {$in: reportsIds}}, { status: nextStatus })
}

const paidOrAddPaymentInfo = async (reportId) => {
	const test = {}
	await InvoicingReports.updateOne({_id: reportId}, {$push: test })
}
module.exports = { setReportsNextStatus }