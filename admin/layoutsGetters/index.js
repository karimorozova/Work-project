const getLayoutProjects = require('./project')
const { getReceivablesSteps, getReceivablesAdditionsSteps } = require('./receivablesReports')
const getLayoutVendors = require('./vendor')

module.exports = {
	getLayoutProjects,
	getReceivablesSteps,
	getReceivablesAdditionsSteps,
	getLayoutVendors
}