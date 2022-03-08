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
	deleteStepFromReport
} = require('./updateReports')


module.exports = {
	deleteReport,
	deleteStepFromReport,
	getAllReportsFromDb,
	reportsFiltersQuery,
	createReports,
	getAllSteps
}