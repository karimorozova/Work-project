const { InvoicingReports } = require("../models")


const setReportsNextStatus = async (reportsIds, nextStatus) => {
	for await (_id of reportsIds) await InvoicingReports.updateOne({_id}, { status: nextStatus })
}

module.exports = { setReportsNextStatus }