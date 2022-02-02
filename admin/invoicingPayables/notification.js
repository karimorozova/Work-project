const { getPayable } = require("./getPayables")
const {
	invoiceReportIsReady,
	invoiceReportIsPaid
} = require('../emailMessages/vendorCommunication')
const { sendFlexibleEmail } = require("../utils")
const { getPaidReport } = require("./getPaidPayables")

const notifyVendorReportsIsSent = async (reportsIds) => {
	let date = new Date()
	const yearAndMonth = `${ date.getFullYear() }_${ date.getMonth() < 10 ? '0' + date.getMonth() : date.getMonth() }`
	const subject = `Your report for ${ yearAndMonth } is ready to be viewed (V011.0)`

	for await (const reportId of reportsIds) {
		const [ { vendor } ] = await getPayable(reportId)
		await sendFlexibleEmail({
			subject,
			nickName: 'Pangea Support',
			from: 'support@pangea.global',
			to: vendor.email
		}, invoiceReportIsReady({
			yearAndMonth,
			reportId,
			vendor
		}))
	}
}

const notifyVendorReportsIsPaid = async (isFull, { reportId: _id }) => {
	let [ { vendor, reportId } ] = isFull
			? await getPaidReport(_id)
			: await getPayable(_id)

	vendor = vendor.hasOwnProperty('_doc') ? vendor._doc : vendor
	const subject = `Your Invoice ${ reportId } has been ${ isFull ? 'paid' : 'partially paid' }  (V013.0)`
	await sendFlexibleEmail({
		subject,
		nickName: 'Pangea Support',
		from: 'support@pangea.global',
		to: vendor.email
	}, invoiceReportIsPaid(isFull, {
		vendor,
		_id,
		reportId
	}))
}

module.exports = {
	notifyVendorReportsIsSent,
	notifyVendorReportsIsPaid
}