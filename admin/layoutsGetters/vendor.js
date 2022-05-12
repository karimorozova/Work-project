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
		...(Object.keys(query).length ? [ { $match: { ...query } } ] : []),
		{
			$project: {
				photo: 1,
				currency: 1,
				website: 1,
				email: 1,
				phone: 1,
				timezone: 1,
				native: 1,
				gender: 1,
				companyName: 1,
				dateInfo: 1,
				catExperience: 1,
				vendorType: 1,
				isTest: 1,
				isAvailableForWork: 1,
				vendorId: 1,
			}
		},
		...(!!options.hasSort && Object.keys(sort).length ? [ { $sort: sort } ] : []),
		...(!!options.hasSkip ? [ { $skip: countToSkip } ] : []),
		...(!!options.hasLimit ? [ { $limit: countToGet } ] : [])
	])

	return vendors
}


const handlerSort = (rawSort) => {
	console.log('Raw Filters', rawSort)

	const sort = {}

	if (!Object.keys(rawSort).length) return { _id: -1 }
	Object.keys(rawSort).forEach(el => {
		const [ , key ] = el.split('_')
		sort[key] = rawSort[el]
	})

	console.log('Ready Sort', sort)
	return sort
}

const handlerQuery = (rawQuery) => {
	console.log('Raw Filters', rawQuery)

	const query = {}
	const reg = /[.*+?^${}()|[\]\\]/g

	if (rawQuery['status'] && rawQuery['status'] !== 'All') {
		query["status"] = rawQuery['status']
	}

	console.log('Ready Filters', query)
	return query
}