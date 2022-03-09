const {
	getAllSteps,
	getAllReportsFromDb
} = require('./getReports')

const {
	createReports
} = require('./createReports')

const {
	reportsFiltersQuery
} = require('./query')

const {
	deleteReport,
	deleteStepFromReport,
	addStepToReport
} = require('./updateReports')


module.exports = {
	addStepToReport,
	deleteReport,
	deleteStepFromReport,
	getAllReportsFromDb,
	reportsFiltersQuery,
	createReports,
	getAllSteps
}