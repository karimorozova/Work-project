const {
	getAllSteps,
	getAllReportsFromDb,
	getShortReportList
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
	getShortReportList,
	addStepToReport,
	deleteReport,
	deleteStepFromReport,
	getAllReportsFromDb,
	reportsFiltersQuery,
	createReports,
	getAllSteps
}