// const { generateReceivablesReportsByTemplate } = require('../projects')
const { InvoicingReceivables } = require('../models')

const generateReportPPP = async (_reportId) => {
	// const filename = 'report_PPP'
	// const template = 'BAR BAR FOO'
	// const path = await generateReceivablesReportsByTemplate(_reportId, filename, template)
	// await InvoicingReceivables.updateOne({ _id: _reportId }, { $push: { reportFiles: { filename: filename + '.pdf', path: path.split('./dist/').pop() } } })
}

module.exports = {
	generateReportPPP
}