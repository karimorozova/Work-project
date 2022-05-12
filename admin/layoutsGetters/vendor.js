const { Vendors } = require("../models")
const { ObjectID: ObjectId } = require("mongodb")

const defaultOptions = {
	hasSkip: true,
	hasLimit: true,
	hasSort: true
}

module.exports = getLayoutVendors = async ({ query = {}, sort = {}, options = {}, countToSkip = 0, countToGet = 50 }) => {

	sort = handlerSort(sort)
	query = handlerQuery(query)

	const vendors = Vendors.aggregate([
		{
			$project: {
				firstName: 1,
				surname: 1
			}
		},
		{
			$addFields: {
				fullName: { $concat: [ "$firstName", " ", "$surname" ] }
			}
		},
		...(!!options.hasSort && Object.keys(sort).length ? [ { $sort: sort } ] : []),
		...(!!options.hasSkip ? [ { $skip: countToSkip } ] : []),
		...(!!options.hasLimit ? [ { $limit: countToGet } ] : [])
	])

	return vendors
}


const handlerSort = (rawSort) => {
	const sort = {}
	if (!Object.keys(rawSort).length) return { _id: -1 }

	return sort
}

const handlerQuery = (rawQuery) => {
	const query = {}
	const reg = /[.*+?^${}()|[\]\\]/g

	if (rawQuery['status'] && rawQuery['status'] !== 'All') {
		query["status"] = rawQuery['status']
	}
	return query
}