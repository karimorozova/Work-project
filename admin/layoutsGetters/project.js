const { Projects } = require("../models")

const defaultOptions = {
	hasSkip: true,
	hasLimit: true,
	hasSort: true
}

module.exports = getLayoutProjects = async ({ query = {}, sort = {}, options = {}, countToSkip = 0, countToGet = 50 }) => {
	sort = handlerSort(sort)
	query = handlerQuery(query)

	options = {
		...defaultOptions,
		...options
	}

	const data = await Projects.aggregate([
		...(Object.keys(query).length ? [ { $math: query } ] : []),
		{
			$project: {
				projectId: 1,
				projectName: 1,
				status: 1,
				customer: 1,
				industry: 1,
				projectManager: 1,
				accountManager: 1,
				requestId: 1,
				isTest: 1,
				isUrgent: 1,
				additionsSteps: 1,
				finance: 1,
				projectCurrency: 1,
				startDate: 1,
				deadline: 1,
				"steps.vendor": 1,
				"steps.status": 1,
				"steps.step": 1,
				"tasks.status": 1,
				"tasks.fullSourceLanguage": 1,
				"tasks.fullTargetLanguage": 1,
				"tasks.service": 1
			}
		},
		{
			$addFields: {
				total: { $add: [ "$finance.Price.receivables", { $sum: '$additionsSteps.finance.Price.receivables' } ] },
				margin: { $subtract: [ "$finance.Price.receivables", "$finance.Price.payables" ] },
				marginPercent: {
					$multiply: [
						100,
						{
							$subtract: [
								1,
								{
									$divide: [
										{ $sum: [ "$finance.Price.payables", 0.001 ] },
										{ $sum: [ "$finance.Price.receivables", 0.001 ] }
									]
								}
							]
						}
					]
				},
				roi: {
					$multiply: [
						100,
						{
							$divide: [
								{
									$subtract: [
										"$finance.Price.receivables",
										"$finance.Price.payables"
									]
								},
								{ $sum: [ "$finance.Price.payables", 0.001 ] }
							]
						}
					]
				}
			}
		},
		...(!!options.hasSort && Object.keys(sort).length ? [ { $sort: sort } ] : []),
		...(!!options.hasSkip ? [ { $skip: countToSkip } ] : []),
		...(!!options.hasLimit ? [ { $limit: countToGet } ] : [])
	])

	return Projects.populate(data, [
		'industry',
		{ path: 'customer', select: [ 'name' ] },
		{ path: 'projectManager', select: [ 'firstName', 'lastName', 'photo' ] },
		{ path: 'accountManager', select: [ 'firstName', 'lastName', 'photo' ] },
		{ path: 'steps.vendor', select: [ 'firstName', 'surname', 'photo' ] },
		{ path: 'steps.step', select: [ 'title' ] },
		{ path: 'tasks.fullSourceLanguage', select: [ 'lang', 'symbol' ] },
		{ path: 'tasks.fullTargetLanguage', select: [ 'lang', 'symbol' ] },
		{ path: 'tasks.service', select: [ 'title' ] },
		{ path: 'requestId', select: [ 'projectId' ] }
	])
}

const handlerSort = (rawSort) => {
	const sort = {}
	if (!Object.keys(rawSort).length) return { _id: -1 }

	if (rawSort['sf_projectID']) {
		sort['projectId'] = +rawSort['sf_projectID']
	}
	if (rawSort['sf_projectName']) {
		sort['projectName'] = +rawSort['sf_projectName']
	}
	if (rawSort['sf_clientName']) {
		sort['customer'] = +rawSort['sf_clientName']
	}
	if (rawSort['sf_startDate']) {
		sort['startDate'] = +rawSort['sf_startDate']
	}
	if (rawSort['sf_deadline']) {
		sort['deadline'] = +rawSort['sf_deadline']
	}
	if (rawSort['sf_projectManager']) {
		sort['projectManager'] = +rawSort['sf_projectManager']
	}
	if (rawSort['sf_accountManager']) {
		sort['accountManager'] = +rawSort['sf_accountManager']
	}
	if (rawSort['sf_industry']) {
		sort['industry'] = +rawSort['sf_industry']
	}
	if (rawSort['sf_isTest']) {
		sort['isTest'] = +rawSort['sf_isTest']
	}
	if (rawSort['sf_payables']) {
		sort['finance.Price.payables'] = +rawSort['sf_payables']
	}
	if (rawSort['sf_receivables']) {
		sort['finance.Price.receivables'] = +rawSort['sf_receivables']
	}
	if (rawSort['sf_total']) {
		sort['total'] = +rawSort['sf_total']
	}
	if (rawSort['sf_margin']) {
		sort['margin'] = +rawSort['sf_margin']
	}
	if (rawSort['sf_marginPercent']) {
		sort['marginPercent'] = +rawSort['sf_marginPercent']
	}
	if (rawSort['sf_roi']) {
		sort['roi'] = +rawSort['sf_roi']
	}
	if (rawSort['sf_projectCurrency']) {
		sort['projectCurrency'] = +rawSort['sf_projectCurrency']
	}
	if (rawSort['sf_status']) {
		sort['status'] = +rawSort['sf_status']
	}
	if (rawSort['sf_urgent']) {
		sort['isUrgent'] = +rawSort['sf_urgent']
	}
	if (rawSort['sf_requestId']) {
		sort['requestId'] = +rawSort['sf_requestId']
	}

	return sort
}

const handlerQuery = (rawQuery) => {
	const query = {}
	console.log('rawQuery', rawQuery)

	return query
}
