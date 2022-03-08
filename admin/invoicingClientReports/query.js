const { ObjectID: ObjectId } = require("mongodb")

const reportsFiltersQuery = ({ reportId, clients, billingDateTo, billingDateFrom, status }) => {
	const query = {}
	const reg = /[.*+?^${}()|[\]\\]/g

	if (reportId) {
		const f = reportId.replace(reg, '\\$&')
		query['reportId'] = { "$regex": new RegExp(f, 'i') }
	}
	if (clients) {
		query["client"] = { $in: clients.split(',').map(item => ObjectId(item)) }
	}
	if (status) {
		query["status"] = status
	}

	if (!!billingDateTo && !!billingDateFrom) {
		query['firstPaymentDate'] = { $gte: new Date(+billingDateFrom) }
		query['lastPaymentDate'] = { $lt: new Date(+billingDateTo) }
	}

	return query
}

module.exports = {
	reportsFiltersQuery
}