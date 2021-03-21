const { Vendors, LangTest, Pricelist } = require('../models')
const { createRateCombinations } = require('./createVendorRates')
const { updateVendorRatesFromCompetence } = require('./updateVendorRates')
const { getCompetenciesForCheck } = require('./helpers')
const { flatten } = require('lodash')
const { generateNewPricelistCombinations } = require('../clients')

const saveQualifications = async (listOfNewCompetencies, vendorId) => {
	const allTests = await LangTest.find({})
	let { qualifications } = await Vendors.findOne({ _id: vendorId })
	let listForRates = []
	const listCompetenciesForSave = listOfNewCompetencies.filter(competence => {
		let currentTest = findSameTestFromCompetence(allTests, competence)
		if (currentTest) {
			competence.testId = currentTest._id
			return competence
		} else {
			listForRates.push(competence)
		}
	})

	let listQualificationsForSave = qualifications

	listCompetenciesForSave.forEach(element => {
		if (!listQualificationsForSave.length) {
			listQualificationsForSave.push(pushFirstQualification(element))
		} else {
			const findIndex = listQualificationsForSave.findIndex(
					qualification => qualification.testId.toString() === element.testId.toString() &&
							qualification.source.toString() === element.sourceLanguage.toString() &&
							qualification.target.toString() === element.targetLanguage.toString()
			)
			if (findIndex === -1) {
				listQualificationsForSave.push(pushFirstQualification(element))
			} else {
				const currentTestForItem = allTests.find((test) => test._id === element.testId)
				const ifExistsStep = isExists(currentTestForItem.steps, element.step)
				const ifExistsIndustry = isExists(currentTestForItem.industries, element.industry)
				if (ifExistsIndustry) qualificationStatusPassed('industries', 'industry')
				if (ifExistsStep) qualificationStatusPassed('steps', 'step')

				function qualificationStatusPassed(arr, key) {
					isExists(listQualificationsForSave[findIndex][arr], element[key]) || listQualificationsForSave[findIndex][arr].push(element[key])
					if (listQualificationsForSave[findIndex].status === 'Passed') listForRates.push(element)
				}
			}
		}
	})

	const rates = await createRateCombinations(listForRates, vendorId)

	return { rates, qualifications: qualificationsArrayAdditions(listQualificationsForSave, allTests) }

	function qualificationsArrayAdditions(qualificationsArray, testsArray) {
		let finalQualificationArray = []
		qualificationsArray.forEach(qualification => {
			let currentTest = findSameTestFromQualification(testsArray, qualification)
			if (currentTest && (!qualification.hasOwnProperty('testType') || qualification.testType === '')) {
				let currentQualification = {}
				Object.assign(currentQualification, qualification.toJSON())
				currentQualification.testType = currentTest.evaluationType === 'Test' ? 'Test' : 'Sample'
				finalQualificationArray.push(currentQualification)
			} else {
				finalQualificationArray.push(qualification.toJSON())
			}
		})
		return finalQualificationArray
	}
}

const saveQualificationsAfterUpdateCompetencies = async (competence, vendorId, oldCompetence) => {
	const allTests = await LangTest.find({})
	let { qualifications, rates, competencies } = await Vendors.findOne({ _id: vendorId })
	let newQualifications = qualifications
	let currentTest = findSameTestFromCompetence(allTests, competence, true)
	if (currentTest) {
		const neededQualificationIndex = qualifications.findIndex(
				qualification => qualification.testId.toString() === currentTest._id.toString() &&
						qualification.source.toString() === competence.sourceLanguage._id &&
						qualification.target.toString() === competence.targetLanguage._id
		)
		if (neededQualificationIndex === -1) {
			newQualifications.push({
				source: competence.sourceLanguage,
				target: competence.targetLanguage,
				industries: [ competence.industry ],
				steps: [ competence.step ],
				testId: currentTest._id.toString(),
				testType: currentTest.evaluationType
			})
		} else {
			const currentTestForItem = allTests.find((test) => test._id.toString() === currentTest._id.toString())
			const ifExistsIndustry = isExists(currentTestForItem.industries, competence.industry._id)
			if (ifExistsIndustry) {
				const ifExistsStepInQualification = isExists(newQualifications[neededQualificationIndex].industries, competence.industry._id)
				ifExistsStepInQualification || newQualifications[neededQualificationIndex].industries.push(competence.industry._id)
			}
			const ifExistsStep = isExists(currentTestForItem.steps, competence.step._id)
			if (ifExistsStep) {
				const ifExistsStepInQualification = isExists(newQualifications[neededQualificationIndex].steps, competence.step._id)
				ifExistsStepInQualification || newQualifications[neededQualificationIndex].steps.push(competence.step._id)
			}
		}


		const defaultPricelist = await Pricelist.findOne({ isVendorDefault: true })
		let neededCompetencies = getCompetenciesForCheck(competencies, oldCompetence._id, allTests)
		neededCompetencies = neededCompetencies.filter((item) =>
				item.sourceLanguage.toString() !== competence.sourceLanguage.toString() &&
				item.targetLanguage.toString() !== competence.targetLanguage.toString() &&
				item.step.toString() !== competence.step.toString() &&
				item.industry.toString() !== competence.industry.toString()
		)

		let passedQualifications = newQualifications.filter(({ status }) => status === 'Passed')
		const passedQualificationsSteps = returnMappedQualificationsByKey(passedQualifications, 'steps')
		const passedQualificationsIndustries = returnMappedQualificationsByKey(passedQualifications, 'industries')

		if (returnLanguagesQualificationIndex(passedQualifications, oldCompetence) === -1 && returnCompetenceIndex(neededCompetencies, oldCompetence) === -1) {
			rates.basicPricesTable = rates.basicPricesTable.filter(row => `${ row.sourceLanguage }-${ row.targetLanguage }` !== `${ oldCompetence.sourceLanguage._id }-${ oldCompetence.targetLanguage._id }`)
		}

		if (!passedQualificationsSteps.includes(oldCompetence.step._id.toString()) && returnNeededKeyIndex('step', oldCompetence) === -1) {
			rates.stepMultipliersTable = rates.stepMultipliersTable.filter(row => `${ row.step }` !== `${ oldCompetence.step._id }`)
		}

		if (!passedQualificationsIndustries.includes(oldCompetence.industry._id.toString()) && returnNeededKeyIndex('industry', oldCompetence) === -1) {
			rates.industryMultipliersTable = rates.industryMultipliersTable.filter(row => `${ row.industry }` !== `${ oldCompetence.industry._id }`)
		}

		if (returnCompetenceIndex(neededCompetencies, competence) === -1 && isExistLanguagesPairInRates() === -1 && returnLanguagesQualificationIndex(passedQualifications, competence) !== -1) {
			rates.basicPricesTable = pushNewBasicPriceItem(rates.basicPricesTable, defaultPricelist, competence.sourceLanguage._id, competence.targetLanguage._id)
			rates.pricelistTable = [ ...rates.pricelistTable, ...generateNewPricelistCombinations(rates.basicPricesTable, rates.stepMultipliersTable, rates.industryMultipliersTable) ]
		}

		if (returnNeededKeyIndex('step', competence) === -1 && isExistStepRates() === -1 && passedQualificationsSteps.includes(competence.step._id.toString())) {
			const { step: { _id: step }, sourceLanguage: { _id: sourceLanguage }, targetLanguage: { _id: targetLanguage }, industry: { _id: industry } } = competence
			const { stepMultipliersTable, pricelistTable } = await createRateCombinations([ { step, sourceLanguage, targetLanguage, industry } ], vendorId)
			rates.stepMultipliersTable = [ ...stepMultipliersTable ]
			rates.pricelistTable = [ ...pricelistTable ]
		}

		if (returnNeededKeyIndex('industry', competence) === -1 && isExistIndustryInRates() === -1 && passedQualificationsIndustries.includes(competence.industry._id.toString())) {
			const { step: { _id: step }, sourceLanguage: { _id: sourceLanguage }, targetLanguage: { _id: targetLanguage }, industry: { _id: industry } } = competence
			const { industryMultipliersTable, pricelistTable } = await createRateCombinations(
					[ { step, sourceLanguage, targetLanguage, industry } ], vendorId)
			rates.industryMultipliersTable = [ ...industryMultipliersTable ]
			rates.pricelistTable = [ ...pricelistTable ]
		}

		function returnLanguagesQualificationIndex(arr, item2) {
			return arr.findIndex(item => `${ item.source }-${ item.target }` === `${ item2.sourceLanguage._id }-${ item2.targetLanguage._id }`)
		}

		function returnCompetenceIndex(arr, item2) {
			return arr.findIndex(item => `${ item.sourceLanguage }-${ item.targetLanguage }` === `${ item2.sourceLanguage._id }-${ item2.targetLanguage._id }`)
		}

		function returnNeededKeyIndex(key, item2) {
			return neededCompetencies.findIndex(item => `${ item[key] }` === `${ item2[key]._id }`)
		}

		function isExistLanguagesPairInRates() {
			return rates.basicPricesTable.findIndex(item => `${ item.sourceLanguage }-${ item.targetLanguage }` === `${ competence.sourceLanguage._id }-${ competence.targetLanguage._id }`)
		}

		function isExistStepRates() {
			return rates.stepMultipliersTable.findIndex(item => `${ item.step }` === `${ competence.step._id }`)
		}

		function isExistIndustryInRates() {
			return rates.industryMultipliersTable.findIndex(item => `${ item.industry }` === `${ competence.industry._id }`)
		}

		function pushNewBasicPriceItem(basicPricesTable, defaultPricelist, sourceLanguage, targetLanguage) {
			const neededLangRow = defaultPricelist.basicPricesTable.find(item => `${ item.sourceLanguage } ${ item.targetLanguage }` === `${ sourceLanguage } ${ targetLanguage }`)
			const basicPrice = !!neededLangRow ? (neededLangRow.euroBasicPrice / 2).toFixed(4) : 0.05
			const type = sourceLanguage.toString() === targetLanguage.toString() ? 'Mono' : 'Duo'
			basicPricesTable.push({ type, sourceLanguage, targetLanguage, basicPrice })
			return basicPricesTable
		}

		function returnMappedQualificationsByKey(arr, key) {
			return flatten(arr.map(row => row[key])).map(item => item.toString())
		}

	} else {
		rates = await updateVendorRatesFromCompetence(vendorId, competence, oldCompetence)
	}

	return {
		rates,
		qualifications: newQualifications
	}
}

const findSameTestFromQualification = (arrTest, qualification) => {
	return arrTest.find(test =>
			test.source.toString() === qualification.source.toString() &&
			test.targets.find(target => target.toString() === qualification.target.toString()) &&
			test.industries.find(industry => qualification.industries.some(currInd => industry.toString() === currInd.toString())) &&
			test.steps.find(step => qualification.steps.some((currentStep) => step.toString() === currentStep.toString()))
	)
}

const findSameTestFromCompetence = (arrTest, competence, includesId = false) => {
	let { sourceLanguage, targetLanguage, industry, step } = competence
	if (includesId) {
		sourceLanguage = sourceLanguage._id
		targetLanguage = targetLanguage._id
		industry = industry._id
		step = step._id
	}
	return arrTest.find(test =>
			test.source.toString() === sourceLanguage.toString() &&
			test.targets.find(target => target.toString() === targetLanguage.toString()) &&
			test.industries.find(testIndustry => testIndustry.toString() === industry.toString()) &&
			test.steps.find(testStep => testStep.toString() === step.toString())
	)
}

const pushFirstQualification = (element) => {
	return {
		source: element.sourceLanguage,
		target: element.targetLanguage,
		industries: [ element.industry ],
		steps: [ element.step ],
		testId: element.testId
	}
}

const isExists = (arr, searchElement) => {
	return arr.map(item => item.toString()).includes(searchElement.toString())
}

module.exports = { saveQualifications, saveQualificationsAfterUpdateCompetencies }
