const { Languages, Units, Industries, CurrencyRatio, Step } = require('../../models')
const ObjectId = require('mongodb').ObjectID
const languageRates = require('../../static/rates/defaulLangsRates')

const getDefaultBasicPrices = async () => {
	const currencyRatio = await CurrencyRatio.find()
	const { USD, GBP } = currencyRatio[0]
	const defaultBasicPrices = []
	const allLanguages = await Languages.find({})
	const EnglishBritain = allLanguages.find(({ lang }) => lang === 'English (United Kingdom)')


	allLanguages.forEach(language => addedDefaultBasicPrices(EnglishBritain, language))
	allLanguages.filter(({ lang }) => lang !== 'English (United Kingdom)').forEach(language => {
		addedDefaultBasicPrices(language, EnglishBritain)
	})
	allLanguages.filter(({ lang }) => lang !== 'English (United Kingdom)').forEach(language => {
		addedDefaultBasicPrices(language, language)
	})

	function getBasicRateForLanguagesPairs(langSource, langTarget) {
		const currentValue = languageRates.findIndex(({ source, target }) => source === langSource && target === langTarget)
		return currentValue !== -1 ? languageRates[currentValue].value : 0.100
	}

	function addedDefaultBasicPrices(source, target) {
		const euroBasicPrice = getBasicRateForLanguagesPairs(source.lang, target.lang)
		return defaultBasicPrices.push({
			type: source.lang === target.lang ? 'Mono' : 'Duo',
			sourceLanguage: source._id,
			targetLanguage: target._id,
			euroBasicPrice: euroBasicPrice,
			usdBasicPrice: (euroBasicPrice * USD).toFixed(4),
			gbpBasicPrice: (euroBasicPrice * GBP).toFixed(4),
			isActive: true
		})
	}

	return defaultBasicPrices
}

const getDefaultStepMultipliers = async () => {
	const allSteps = await Step.find()
	const units = await Units.find()
	const defaultStepMultipliers = []
	for (let { _id, steps } of units) {
		steps.forEach(step => defaultStepMultipliers.push({
			multiplier: getStepMultiplier(allSteps, step),
			step: step._id,
			unit: _id,
			euroMinPrice: 0,
			usdMinPrice: 0,
			gbpMinPrice: 0,
			isActive: true
		}))
	}
	return defaultStepMultipliers
}

const getDefaultIndustryMultipliers = async () => {
	const industries = await Industries.find()
	const defaultIndustryMultipliers = []
	for (let { _id } of industries) {
		defaultIndustryMultipliers.push({
			industry: _id,
			isActive: true
		})
	}
	return defaultIndustryMultipliers
}

function getStepMultiplier(allSteps, stepId) {
	const { title } = allSteps.find(({ _id }) => _id.toString() === stepId.toString())
	switch (title) {
		case "Proofreading":
			return 50
		case "Revising":
			return 30
		case "Review":
			return 50
		case "ICR":
			return 50
		case "QA":
			return 30000
		default:
			return 100
	}
}

module.exports = { getDefaultBasicPrices, getDefaultStepMultipliers, getDefaultIndustryMultipliers }
