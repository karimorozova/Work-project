const { generateReceivablesReportsByTemplate } = require('../projects')
const { InvoicingReceivables } = require('../models')
const { pdfPPPReportTemplate } = require('../emailMessages/clientCommunication')

const generateReportPPP = async (_reportId, report, BI) => {
	const filename = 'report_PPP'
	const template = await pdfPPPReportTemplate(report, BI)
	const path = await generateReceivablesReportsByTemplate(_reportId, filename, template)
	await InvoicingReceivables.updateOne({ _id: _reportId }, { $push: { reportFiles: { filename: filename + '.pdf', path: path.split('./dist/').pop() } } })

	return { filename: filename + '.pdf', path: path.split('./dist/').pop() }
}

module.exports = {
	generateReportPPP
}