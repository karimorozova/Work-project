const { Vendors, Pricelist } = require("../models")
const { getFilteringQuery, getFilteringQueryPotential } = require("./filter")
const moment = require('moment')
const _ = require('lodash')

const getVendorsForSteps = async () => {
	const { basicPricesTable, stepMultipliersTable, industryMultipliersTable } = await Pricelist.findOne({ isVendorDefault: true })

	let vendors = []
	let dbVendors = await Vendors.find(
			{ status: "Active" },
			{
				"firstName": 1,
				"surname": 1,
				"rates.pricelistTable": 1,
				"email": 1,
				"qualifications": 1,
				"assessments": 1,
				"photo": 1
			})
			.populate('rates.pricelistTable.sourceLanguage', [ 'lang' ])
			.populate('rates.pricelistTable.targetLanguage', [ 'lang' ])
			.populate('rates.pricelistTable.step', [ 'title' ])
			.populate('rates.pricelistTable.unit', [ 'type' ])
			.populate('rates.pricelistTable.industry', [ 'name' ])


	dbVendors.forEach(vendor => {

		const vendorAssessments = _.flatten(vendor.assessments.map(item => {
			const res = []
			item.industries.forEach(industry => {
				industry.steps.forEach(step => {
					res.push({
						[`${ item.sourceLanguage }-${ item.targetLanguage }-${ step.step }-${ industry.industry }`]: {
							lqa1: step.lqa1.grade || 0,
							lqa2: step.lqa2.grade || 0,
							lqa3: step.lqa3.grade || 0
						}
					})
				})
			})
			return res
		}))

		const vendorQualifications = _.flatten(vendor.qualifications.map(item => {
			const res = []
			item.industries.forEach(industry => {
				item.steps.forEach(step => {
					res.push({ [`${ item.source }-${ item.target }-${ step }-${ industry }`]: item.tqi })
				})
			})
			return res
		}))

		const pricelistTable = vendor.rates.pricelistTable.map(item => {
			return {
				...item._doc,
				...getBenchmarkAdditions(item, basicPricesTable, stepMultipliersTable, industryMultipliersTable),
				...getTQI(vendorQualifications, item),
				...getLQA(vendorAssessments, item)
			}
		})

		delete vendor._doc.qualifications
		delete vendor._doc.assessments

		vendors.push({
			...vendor._doc,
			rates: {
				pricelistTable
			},
			name: `${ vendor.firstName } ${ vendor.surname || '' }`
		})
	})

	return vendors

	function getLQA(assessments, rate) {
		const grades = assessments.find(item =>
				Object.keys(item)[0] === `${ rate.sourceLanguage._id }-${ rate.targetLanguage._id }-${ rate.step._id }-${ rate.industry._id }`
		)
		return grades ? Object.values(grades)[0] : { lqa1: 0, lqa2: 0, lqa3: 0 }
	}

	function getTQI(qualifications, rate) {
		const tqi = qualifications.find(item =>
				Object.keys(item)[0] === `${ rate.sourceLanguage._id }-${ rate.targetLanguage._id }-${ rate.step._id }-${ rate.industry._id }`
		)
		return {
			tqi: tqi ? Object.values(tqi)[0] : 0
		}
	}
}

function getBenchmarkAdditions(item, basicPricesTable, stepMultipliersTable, industryMultipliersTable) {
	const L = basicPricesTable.find(({ sourceLanguage, targetLanguage }) =>
			`${ sourceLanguage }-${ targetLanguage }` === `${ item.sourceLanguage._id }-${ item.targetLanguage._id }`)
	const S = stepMultipliersTable.find(({ step, unit }) =>
			`${ step }-${ unit }` === `${ item.step._id }-${ item.unit._id }`)
	const I = industryMultipliersTable.find(({ industry }) =>
			`${ industry }` === `${ item.industry._id }`)

	const benchmark = L && S && I ? +(calculateBenchmark(L, S, I)).toFixed(4) : 0

	return {
		benchmark,
		benchmarkMargin: benchmark ? +(benchmark - item.price).toFixed(4) : 0
	}

	function calculateBenchmark(euroBasicPrice, stepMultiplier, industryMultiplier) {
		return (euroBasicPrice.euroBasicPrice * (stepMultiplier.multiplier / 100)) * (industryMultiplier.multiplier / 100) / 2
	}
}

async function getVendorStepDetails(id, stepInfo) {
	const groupStepInfo = `${ stepInfo.source }-${ stepInfo.target }-${ stepInfo.step }-${ stepInfo.unit }-${ stepInfo.industry }`
	const groupStepInfoWithoutUnit = `${ stepInfo.source }-${ stepInfo.target }-${ stepInfo.step }-${ stepInfo.industry }`
	const { basicPricesTable, stepMultipliersTable, industryMultipliersTable } = await Pricelist.findOne({ isVendorDefault: true })
	let vendor = await Vendors.findOne(
			{ _id: id },
			{
				"firstName": 1,
				"surname": 1,
				"rates.pricelistTable": 1,
				"email": 1,
				"qualifications": 1,
				"assessments": 1,
				"photo": 1
			})
			.populate('rates.pricelistTable.sourceLanguage', [ 'lang' ])
			.populate('rates.pricelistTable.targetLanguage', [ 'lang' ])
			.populate('rates.pricelistTable.step', [ 'title' ])
			.populate('rates.pricelistTable.unit', [ 'type' ])
			.populate('rates.pricelistTable.industry', [ 'name' ]).lean()


	const priceListTable = vendor.rates.pricelistTable.find(({ sourceLanguage, targetLanguage, step, unit, industry }) => {
		const currentInfo = `${ sourceLanguage._id }-${ targetLanguage._id }-${ step._id }-${ unit._id }-${ industry._id }`
		return groupStepInfo === currentInfo
	})
	const stepInfoForBenchmark = {
		sourceLanguage: { _id: stepInfo.source },
		targetLanguage: { _id: stepInfo.target },
		step: { _id: stepInfo.step },
		unit: { _id: stepInfo.unit },
		industry: { _id: stepInfo.industry }
	}

	if (!priceListTable) return {
		name: vendor.firstName + ' ' + vendor.surname || '',
		photo: vendor.photo,
		email: vendor.email,
		tqi: 0,
		...getBenchmarkAdditions(stepInfoForBenchmark, basicPricesTable, stepMultipliersTable, industryMultipliersTable),
		lqa1: 0,
		lqa2: 0,
		lqa3: 0
	}

	const vendorAssessments = vendor.assessments.find(item => {
		for (industry of item.industries) {
			for (step of industry.steps) {
				const current = `${ item.sourceLanguage.toString() }-${ item.targetLanguage.toString() }-${ step.step.toString() }-${ industry.industry.toString() }`
				// if (current === groupStepInfoWithoutUnit) console.log(item)
				return current === groupStepInfoWithoutUnit
			}
		}
	})

	const vendorQualifications = vendor.qualifications.find(item => {
		for (industry of item.industries) {
			for (step of item.steps) {
				const current = `${ item.source }-${ item.target }-${ step }-${ industry }`
				return current === groupStepInfoWithoutUnit
			}
		}
	})
	const { lqa1: { grade: lqa1 = 0 } = 0, lqa2: { grade: lqa2 = 0 } = 0, lqa3: { grade: lqa3 = 0 } = 0 } = vendorAssessments ? vendorAssessments.industries[0].steps[0] : {}
	const { tqi = 0 } = vendorQualifications ? vendorQualifications : {}
	return {
		name: vendor.firstName + ' ' + vendor.surname || '',
		photo: vendor.photo,
		email: vendor.email,
		tqi: tqi || 0,
		lqa1,
		lqa2,
		lqa3,
		...getBenchmarkAdditions(stepInfoForBenchmark, basicPricesTable, stepMultipliersTable, industryMultipliersTable)
	}
}

const getVendorForPortal = async (query) => {
	return (await Vendors.findOne(query, {
				photo: 1,
				firstName: 1,
				status: 1,
				surname: 1,
				email: 1,
				phone: 1,
				timezone: 1,
        currency: 1,
				native: 1,
				gender: 1,
				skype: 1,
				availability: 1,
				password: 1,
				memoqUserName: 1,
				guid: 1,
        facebook: 1,
        experienceYears: 1,
        linkedin: 1,
        catExperience: 1,
        twitter: 1,
        softwares: 1,
        instagram: 1,
        telegram: 1,
        website: 1,
        whatsapp: 1,
        socialMedia: 1,

			}).populate('native')
	)
}

const getVendorExtraForPortal = async (query) => {
	return (await Vendors.findOne(query, {
				documents: 1,
				profExperiences: 1,
				educations: 1,
				matrix: 1,
				competencies: 1,
				qualifications: 1,
				assessments: 1,
				pendingCompetencies: 1,
				rates: 1,
				billingInfo: 1
			})
					.populate('qualifications.source', [ 'lang' ])
					.populate('qualifications.target', [ 'lang' ])
					.populate('qualifications.industries', [ 'name' ])
					.populate('qualifications.steps', [ 'title' ])
					.populate('assessments.sourceLanguage', [ 'lang' ])
					.populate('assessments.targetLanguage', [ 'lang' ])
					.populate("assessments.industries.industry", [ 'name' ])
					.populate("assessments.industries.steps.step", [ 'title' ])
					.populate('competencies.sourceLanguage', [ 'lang' ])
					.populate('competencies.targetLanguage', [ 'lang' ])
					.populate('competencies.industry', [ 'name' ])
					.populate('competencies.step', [ 'title' ])
					.populate('competencies.step.calculationUnit', [ 'type' ])
					.populate('rates.basicPricesTable.sourceLanguage', [ 'lang', 'iso1' ])
					.populate('rates.basicPricesTable.targetLanguage', [ 'lang', 'iso1' ])
					.populate('rates.stepMultipliersTable.step', [ 'title' ])
					.populate('rates.stepMultipliersTable.unit', [ 'type' ])
					.populate('rates.industryMultipliersTable.industry', [ 'name', 'icon' ])
					.populate('rates.pricelistTable.sourceLanguage', [ 'lang' ])
					.populate('rates.pricelistTable.targetLanguage', [ 'lang' ])
					.populate('rates.pricelistTable.step', [ 'title' ])
					.populate('rates.pricelistTable.unit', [ 'type' ])
					.populate('rates.pricelistTable.industry', [ 'name' ])
					.populate('pendingCompetencies.sourceLanguage', [ 'lang' ])
					.populate('pendingCompetencies.targetLanguage', [ 'lang' ])
					.populate('pendingCompetencies.industry', [ 'name' ])
					.populate('pendingCompetencies.step', [ 'title' ])
	)
}

async function getVendor(query) {
	return (await Vendors.findOne(query)
			.populate('native')
			.populate('industries', [ 'name', 'icon' ])
			.populate('languagePairs.source')
			.populate('languagePairs.target')
			.populate('qualifications.source', [ 'lang' ])
			.populate('qualifications.target', [ 'lang' ])
			.populate('qualifications.industries', [ 'name' ])
			.populate('qualifications.steps', [ 'title' ])
			.populate('assessments.sourceLanguage', [ 'lang' ])
			.populate('assessments.targetLanguage', [ 'lang' ])
			.populate("assessments.industries.industry", [ 'name' ])
			.populate("assessments.industries.steps.step", [ 'title' ])
			.populate('competencies.sourceLanguage', [ 'lang' ])
			.populate('competencies.targetLanguage', [ 'lang' ])
			.populate('competencies.industry', [ 'name' ])
			.populate('competencies.step', [ 'title' ])
			.populate('competencies.step.calculationUnit', [ 'type' ])
			.populate('rates.basicPricesTable.sourceLanguage', [ 'lang', 'iso1' ])
			.populate('rates.basicPricesTable.targetLanguage', [ 'lang', 'iso1' ])
			.populate('rates.stepMultipliersTable.step', [ 'title' ])
			.populate('rates.stepMultipliersTable.unit', [ 'type' ])
			.populate('rates.industryMultipliersTable.industry', [ 'name', 'icon' ])
			.populate('rates.pricelistTable.sourceLanguage', [ 'lang' ])
			.populate('rates.pricelistTable.targetLanguage', [ 'lang' ])
			.populate('rates.pricelistTable.step', [ 'title' ])
			.populate('rates.pricelistTable.unit', [ 'type' ])
			.populate('rates.pricelistTable.industry', [ 'name' ])
			.populate('pendingCompetencies.sourceLanguage', [ 'lang' ])
			.populate('pendingCompetencies.targetLanguage', [ 'lang' ])
			.populate('pendingCompetencies.industry', [ 'name' ])
			.populate('pendingCompetencies.step', [ 'title' ]))
}

async function hasVendorCompetenciesAndPending(vendorId) {
	const vendor = await Vendors.findOne({ _id: vendorId })
	return !vendor.competencies.length && !vendor.pendingCompetencies.length
}

async function getVendors(query) {
	return (await Vendors.find(query)
			.populate('native')
			.populate('industries', [ 'name', 'icon' ])
			.populate('languagePairs.source')
			.populate('languagePairs.target')
			.populate('qualifications.source', [ 'lang' ])
			.populate('qualifications.target', [ 'lang' ])
			.populate('qualifications.industries', [ 'name' ])
			.populate('qualifications.steps', [ 'title' ])
			.populate('assessments.sourceLanguage', [ 'lang' ])
			.populate('assessments.targetLanguage', [ 'lang' ])
			.populate("assessments.industries.industry", [ 'name' ])
			.populate("assessments.industries.steps.step", [ 'title' ])
			.populate('competencies.sourceLanguage', [ 'lang' ])
			.populate('competencies.targetLanguage', [ 'lang' ])
			.populate('competencies.industry', [ 'name' ])
			.populate('competencies.step', [ 'title' ])
			.populate('competencies.step.calculationUnit', [ 'type' ])
			.populate('rates.basicPricesTable.sourceLanguage', [ 'lang', 'iso1' ])
			.populate('rates.basicPricesTable.targetLanguage', [ 'lang', 'iso1' ])
			.populate('rates.stepMultipliersTable.step', [ 'title' ])
			.populate('rates.stepMultipliersTable.unit', [ 'type' ])
			.populate('rates.industryMultipliersTable.industry', [ 'icon' ])
			.populate('rates.pricelistTable.sourceLanguage', [ 'lang' ])
			.populate('rates.pricelistTable.targetLanguage', [ 'lang' ])
			.populate('rates.pricelistTable.step', [ 'title' ])
			.populate('rates.pricelistTable.unit', [ 'type' ])
			.populate('rates.pricelistTable.industry', [ 'name' ]))
}

async function getVendorAfterUpdate(query, update) {
	return (await Vendors.findOneAndUpdate(query, update, { new: true })
			.populate("native")
			.populate('industries', [ 'name', 'icon' ])
			.populate("languagePairs.source")
			.populate("languagePairs.target")
			.populate("qualifications.source", [ 'lang' ])
			.populate("qualifications.target", [ 'lang' ])
			.populate("qualifications.industries", [ 'name' ])
			.populate("qualifications.steps", [ 'title' ])
			.populate("assessments.sourceLanguage", [ 'lang' ])
			.populate("assessments.targetLanguage", [ 'lang' ])
			.populate("assessments.industries.industry", [ 'name' ])
			.populate("assessments.industries.steps.step", [ 'title' ])
			.populate('competencies.sourceLanguage', [ 'lang', 'symbol' ])
			.populate('competencies.targetLanguage', [ 'lang', 'symbol' ])
			.populate('competencies.industry', [ 'name' ])
			.populate('competencies.step', [ 'title' ])
			.populate('competencies.step.calculationUnit', [ 'type' ])
			.populate('rates.basicPricesTable.sourceLanguage', [ 'lang', 'iso1' ])
			.populate('rates.basicPricesTable.targetLanguage', [ 'lang', 'iso1' ])
			.populate('rates.stepMultipliersTable.step', [ 'title' ])
			.populate('rates.stepMultipliersTable.unit', [ 'type' ])
			.populate('rates.industryMultipliersTable.industry', [ 'icon' ])
			.populate('rates.pricelistTable.sourceLanguage', [ 'lang' ])
			.populate('rates.pricelistTable.targetLanguage', [ 'lang' ])
			.populate('rates.pricelistTable.step', [ 'title' ])
			.populate('rates.pricelistTable.unit', [ 'type' ])
			.populate('rates.pricelistTable.industry', [ 'name' ])
			.populate('pendingCompetencies.sourceLanguage', [ 'lang' ])
			.populate('pendingCompetencies.targetLanguage', [ 'lang' ])
			.populate('pendingCompetencies.industry', [ 'name' ])
			.populate('pendingCompetencies.step', [ 'title' ]))
}

async function getFilteredVendors(filters) {
	try {
		const query = await getFilteringQuery(filters)
		return await Vendors.find(query, {
			firstName: 1,
			status: 1,
			surname: 1,
			competencies: 1,
			native: 1,
			industries: 1,
			isTest: 1
		})
				.sort({ _id: 1 }).limit(25)
				.populate("industries")
				.populate("native")
				.populate('pendingCompetencies.sourceLanguage')
				.populate('pendingCompetencies.targetLanguage')
				.populate('competencies.sourceLanguage')
				.populate('competencies.targetLanguage')
	} catch (err) {
		console.log(err)
		console.log("Error on filtering vendors")
	}
}

async function getFilteredVendorsPotential(filters) {
	try {

		const query = getFilteringQueryPotential(filters)

		let vendors = await Vendors.find(query, {
			firstName: 1,
			status: 1,
			surname: 1,
			competencies: 1,
			native: 1,
			industries: 1,
			isTest: 1,
			dateInfo: 1
		}).sort({ _id: 1 }).limit(25)
				.populate("industries")
				.populate("native")
				.populate('pendingCompetencies.sourceLanguage')
				.populate('pendingCompetencies.targetLanguage')

		const rebuildVendors = vendors.map(item => {
			return {
				...item._doc,
				date: moment(item._doc.dateInfo.createdAt).format("DD-MM-YYYY, HH:ss")
			}
		})


		return rebuildVendors

	} catch (err) {
		console.log(err)
		console.log("Error on filtering vendors")
	}
}

module.exports = {
	getVendor,
	getVendors,
	getVendorAfterUpdate,
	getFilteredVendors,
	hasVendorCompetenciesAndPending,
	getFilteredVendorsPotential,
	getVendorsForSteps,
	getVendorStepDetails,
	getVendorForPortal,
	getVendorExtraForPortal
}
