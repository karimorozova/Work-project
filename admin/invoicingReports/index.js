const {
	reportAddSteps,
	addStepsToRequest,
} = require('./createReports')

const {
	reportDeleteStep,
} = require('./deleteReports')

const {
	getAllReports,
	getReport,
	getAllSteps,
	stepsFiltersQuery,
	reportsFiltersQuery,
} = require('./getReports')

module.exports = {
	getAllReports,
	getReport,
	reportAddSteps,
	reportDeleteStep,
	getAllSteps,
	addStepsToRequest,
	stepsFiltersQuery,
	reportsFiltersQuery,
}