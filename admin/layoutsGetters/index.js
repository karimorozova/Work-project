const getLayoutProjects = require('./project')
const { getReceivablesSteps, getReceivablesAdditionsSteps } = require('./receivablesReportsSteps')
const getLayoutVendors = require('./vendor')

module.exports = {
	getLayoutProjects,
	getReceivablesSteps,
	getReceivablesAdditionsSteps,
	getLayoutVendors
}