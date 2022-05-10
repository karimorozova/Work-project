const {
	Vendors,
	Languages,
	Industries,
	Step,
	Pricelist,
	Units,
	LangTest
} = require('../models')

const ObjectId = require('mongodb').ObjectID
const { getVendor } = require('./getVendors')
const { testSentMessage } = require("../emailMessages/candidateCommunication")
const { sendEmail } = require('../utils/mailTemplate')
const fs = require('fs')

const getFilteredVendorsPendingCompetencies = async (filters) => {
	const languages = await Languages.find()
	const industries = await Industries.find()
	const steps = await Step.find()

	let query = {}
	const { sourceFilter, targetFilter, vendorStatusFilter, industryFilter, stepFilter, urgencyFilter } = filters
	const [ sourceQ, targetQ, industryQ, stepQ ] = [ 'pendingCompetencies.sourceLanguage', 'pendingCompetencies.targetLanguage', 'pendingCompetencies.industry', 'pendingCompetencies.step' ]

	if (!liveAll(sourceFilter)) query[sourceQ] = queryPart(sourceFilter, languages, 'lang')
	if (!liveAll(targetFilter)) query[targetQ] = queryPart(targetFilter, languages, 'lang')
	if (!liveAll(industryFilter)) query[industryQ] = queryPart(industryFilter, industries, 'name')
	if (!liveAll(stepFilter)) query[stepQ] = queryPart(stepFilter, steps, 'title')
	if (!liveAll(vendorStatusFilter)) query['status'] = { $in: vendorStatusFilter }

	const match = Object.keys(query).length ? { ...query } : {}
	let result = await Vendors.populate(
			await Vendors.aggregate([
				{ $match: match }
			]), [
				{ path: 'native', select: [ 'lang' ] },
				{ path: sourceQ, select: [ 'lang' ] },
				{ path: targetQ, select: [ 'lang' ] },
				{ path: industryQ, select: [ 'name' ] },
				{ path: stepQ, select: [ 'title' ] }
			])

	result = result.reduce((acc, curr) => {
		const { _id, pendingCompetencies, firstName, surname, native } = curr
		if (pendingCompetencies != null && pendingCompetencies.length) {

			let filteredCompetencies = filterCompetencies(pendingCompetencies)

			filteredCompetencies = filteredCompetencies.reduce((acc2, curr2) => {
				curr2 = { ...curr2, vendorName: `${ firstName } ${ surname }`, link: _id, native }
				acc2.push(curr2)
				return acc2
			}, [])

			acc.push(...filteredCompetencies)
		}
		return acc
	}, [])

	return result

	function liveAll(arr) {
		return arr.includes('All')
	}

	function getIds(arr, idsArr, key) {
		return arr.map(i => idsArr.find(j => j[key] === i)._id)
	}

	function queryPart(...arguments) {
		return { $in: getIds(...arguments).map(item => ObjectId(item)) }
	}

	function filterCompetencies(arr) {
		return arr
				.filter(item => !liveAll(sourceFilter) ?
						sourceFilter.includes(item.sourceLanguage.lang) :
						item
				)
				.filter(item => !liveAll(targetFilter) ?
						targetFilter.includes(item.targetLanguage.lang) :
						item
				)
				.filter(item => !liveAll(industryFilter) ?
						industryFilter.includes(item.industry.name) :
						item
				)
				.filter(item => !liveAll(stepFilter) ?
						stepFilter.includes(item.step.title) :
						item
				)
	}
}

const extendVendorsPendingCompetencies = async (pendingCompetencies) => {
	const { basicPricesTable, stepMultipliersTable, industryMultipliersTable } = await Pricelist.findOne({ isVendorDefault: true })
	const allUnits = await Units.find()
	const { _id: catUnitId } = allUnits.find(({ type }) => type === 'CAT Wordcount')
	const { _id: sourceWordId } = allUnits.find(({ type }) => type === 'Source Word')?._id || allUnits[0]

	pendingCompetencies = pendingCompetencies.map(item => {
		const {
			sourceLanguage: { _id: sourceLanguagePC },
			targetLanguage: { _id: targetLanguagePC },
			step: { _id: stepPC },
			industry: { _id: industryPC }
		} = item

		const euroBasicPrice = basicPricesTable.find(({ sourceLanguage, targetLanguage }) => `${ sourceLanguage }-${ targetLanguage }` === `${ sourceLanguagePC }-${ targetLanguagePC }`)
		const stepMultiplier = stepMultipliersTable.find(({ step, unit }) => `${ step }-${ unit }` === `${ stepPC }-${ sourceWordId }`)
		const industryMultiplier = industryMultipliersTable.find(({ industry }) => `${ industry }` === `${ industryPC }`)
		const systemRate = euroBasicPrice && stepMultiplier && industryMultiplier ? calculateRate(euroBasicPrice, stepMultiplier, industryMultiplier) : 0

		return {
			...item,
			systemRate
		}

		function calculateRate(euroBasicPrice, stepMultiplier, industryMultiplier) {
			return (euroBasicPrice.euroBasicPrice * (stepMultiplier.multiplier / 100)) * (industryMultiplier.multiplier / 100) / 2
		}
	})

	return pendingCompetencies
}

const approvePendingCompetence = async ({ vendorId, pendingCompetence }) => {
	let vendor = await getVendor({ _id: vendorId })
	vendor.pendingCompetencies = vendor.pendingCompetencies.filter(({ _id }) =>
			`${ _id }` !== pendingCompetence._id)

	delete pendingCompetence._id
	vendor.approvedPendingCompetencies.push(pendingCompetence)

	await Vendors.updateOne({ _id: vendorId }, vendor)
}

const setRatePriceAfterPassedTest = async (vendorId, qualification) => {
	let vendor = await getVendor({ _id: vendorId })
	let approvedQualifications = generateQualificationsCombinations([ qualification ])
	const matchesAPC = vendor.approvedPendingCompetencies
			.filter(({ sourceLanguage, targetLanguage, industry, step }) =>
					approvedQualifications
							.map(({ sourceLanguage, targetLanguage, industry, step }) => `${ sourceLanguage }-${ targetLanguage }-${ industry }-${ step }`)
							.includes(`${ sourceLanguage }-${ targetLanguage }-${ industry }-${ step }`))

	const { rates, filteredAPC } = setUpRate(vendor.approvedPendingCompetencies, matchesAPC, vendor.rates.pricelistTable)
	vendor.approvedPendingCompetencies = filteredAPC
	vendor.rates.pricelistTable = rates

	await Vendors.updateOne({ _id: vendorId }, vendor)
}

const setRatePriceAfterApprovalPC = async (vendorId) => {
	let vendor = await getVendor({ _id: vendorId })
	let allQualifications = generateQualificationsCombinations(vendor.qualifications)
	const notMatchesAPC = vendor.approvedPendingCompetencies.filter(({ sourceLanguage, targetLanguage, industry, step }) =>
			!allQualifications
					.map(({ sourceLanguage, targetLanguage, industry, step }) => `${ sourceLanguage }-${ targetLanguage }-${ industry }-${ step }`)
					.includes(`${ sourceLanguage }-${ targetLanguage }-${ industry }-${ step }`))

	const { rates, filteredAPC } = setUpRate(vendor.approvedPendingCompetencies, notMatchesAPC, vendor.rates.pricelistTable)
	vendor.approvedPendingCompetencies = filteredAPC
	vendor.rates.pricelistTable = rates

	await Vendors.updateOne({ _id: vendorId }, vendor)
}

const sendVendorTestAndUpdateQualification = async (vendorId) => {
	let vendor = await getVendor({ _id: vendorId })
	const allTests = await LangTest.find()

	for (let ACP of vendor.approvedPendingCompetencies) {
		const { sourceLanguage, targetLanguage, industry, step } = ACP
		vendor.qualifications = vendor.qualifications.map(item => {
			const match =
					`${ sourceLanguage }-${ targetLanguage }` === `${ item.source._id }-${ item.target._id }` &&
					item.industries.map(({ _id }) => _id.toString()).includes(`${ industry }`) &&
					item.steps.map(({ _id }) => _id.toString()).includes(`${ step }`)

			if (match && item.status === 'Created') {
				item.status = 'Test Sent'
				const message = testSentMessage({
					firstName: vendor.firstName,
					industries: item.industries,
					target: item.target,
					source: item.source
				})

				const { path } = allTests.find(test => test._id.toString() === item.testId)
				const attachments = [ { filename: path.split('/').pop(), content: fs.createReadStream(`./dist${ path }`) } ]
				sendEmail({
					to: vendor.email,
					subject: `${ item.target.lang } - Translator@Pangea position - Sample text for translation (ID CAN001.0)`,
					attachments
				}, message)
			}

			return item
		})
	}
	await Vendors.updateOne({ _id: vendorId }, vendor)

	return vendor
}

const rejectedPendingCompetence = async (vendorId, pendingCompetence, template) => {

	let vendor = await getVendor({ _id: vendorId })

	vendor.pendingCompetencies = vendor.pendingCompetencies
			.filter(({ _id }) => _id.toString() !== pendingCompetence._id)

	const { sourceLanguage: { lang: source }, targetLanguage: { lang: target }, industry: { name } } = pendingCompetence

	await sendEmail({
		to: vendor.email,
		subject: `Competency: ${ source } >> ${ target } for ${ name } has been declined (ID CAN012.0)`
	}, template)

	await Vendors.updateOne({ _id: vendorId }, vendor)
	return vendor
}

const deletePendingCompetence = async (vendorId, pendingCompetence) => {
	let vendor = await getVendor({ _id: vendorId })

	vendor.pendingCompetencies = vendor.pendingCompetencies
			.filter(({ _id }) => _id.toString() !== pendingCompetence._id)

	await Vendors.updateOne({ _id: vendorId }, vendor)
	return vendor
}

//internal helpers =>
function setUpRate(AllAPC, APCarr, rates) {
	for (let APC of APCarr) {
		rates = rates.map(item => {
			const match =
					`${ item.sourceLanguage._id }-${ item.targetLanguage._id }-${ item.industry._id }-${ item.step._id }` ===
					`${ APC.sourceLanguage }-${ APC.targetLanguage }-${ APC.industry }-${ APC.step }`

			if (match) {
				item.price = APC.rate
				item.altered = true
				item.notification = 'Changed! Price taken from pending competence.'
			}
			return item
		})
		AllAPC = AllAPC.filter(({ _id }) => `${ _id }` !== `${ APC._id }`)
	}
	return { rates, filteredAPC: AllAPC }
}

function generateQualificationsCombinations(qualifications) {
	let listOfQualifications = []

	for (let qualification of qualifications) {
		const { source, target, steps, industries } = qualification
		steps.forEach(step => {
			industries.forEach(industry => {
				listOfQualifications.push({
					sourceLanguage: source._id,
					targetLanguage: target._id,
					industry: industry._id,
					step: step._id
				})
			})
		})
	}
	return listOfQualifications
}


module.exports = {
	getFilteredVendorsPendingCompetencies,
	extendVendorsPendingCompetencies,
	approvePendingCompetence,
	setRatePriceAfterPassedTest,
	setRatePriceAfterApprovalPC,
	sendVendorTestAndUpdateQualification,
	rejectedPendingCompetence,
	deletePendingCompetence
}
