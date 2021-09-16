const {
	getAllTasks,
	reportsFiltersQuery,
	getAllReports,
	getReportById
} = require('./getReceivables')

const {
	createReports
} = require('./createReceivables')

const {
	receivableDelete
} = require('./deleteReceivables')

module.exports = {
	getReportById,
	getAllReports,
	reportsFiltersQuery,
	createReports,
	getAllTasks,
	receivableDelete,
}