const { Pricelist, VendorBenchmarkCost, Vendors } = require('../models')
const { multiplyPrices } = require('../multipliers')

const saveVendorBenchmarkCost = async () => {

	const priceInfo = await Pricelist.findOne({isActive: true})
			.populate('basicPricesTable.sourceLanguage', 'lang')
			.populate('basicPricesTable.targetLanguage', 'lang')

	const allVendors = await Vendors.find()
			.populate('rates.pricelistTable.sourceLanguage', 'lang')
			.populate('rates.pricelistTable.targetLanguage', 'lang')
			.populate('rates.pricelistTable.step', 'title')
			.populate('rates.pricelistTable.unit', 'type')

	const allBenchmarks = getBenchmarks(priceInfo)
	const result = getVendorBenchmarkCost(allVendors, allBenchmarks)

	return result

	function getBenchmarks(priceInfo) {
		const { basicPricesTable, industryMultipliersTable, stepMultipliersTable } = priceInfo
		let result = {}
		basicPricesTable.forEach(({ sourceLanguage, targetLanguage, euroBasicPrice}) => {
			const langPair = sourceLanguage.lang + ' >> ' + targetLanguage.lang
			result[langPair] = {}
			industryMultipliersTable.forEach(({ industry, multiplier: industryMultiplierValue }) => {
				result[langPair][industry] = {}
				stepMultipliersTable.forEach(({ step, unit, size, multiplier: stepMultiplierValue }) => {
					const rate = multiplyPrices(euroBasicPrice, stepMultiplierValue, size, industryMultiplierValue);
					const stepAndUnitKey = step + '/' + unit
					result[langPair][industry][stepAndUnitKey] = rate
				})
			})
		})
		 return result
	}

	function getVendorBenchmarkCost(allVendors, allBenchmarks) {
		const vendorBenchmarks = []
		allVendors.forEach(vendor => {
			vendor.rates.pricelistTable.forEach(({ sourceLanguage, targetLanguage, industry, step, unit, price }) => {
				// console.log(step.title !== 'Translation',unit.type !== 'CAT Wordcount')
				if(step.title !== 'Translation' || unit.type !== 'CAT Wordcount') return

				const languagePair = sourceLanguage.lang + ' >> ' + targetLanguage.lang

				const stepAndUnitInfo = step + '/' + unit
				const benchmark = allBenchmarks[languagePair][industry][stepAndUnitInfo]

				const vendorInfo = {
					baseRate: price,
					margin: benchmark - price,
					vendorName: vendor.firstName,
					vendor: vendor._id
				}
				const stepInfo = {
					step,
					unit,
					benchmark,
					vendorInfo,
				}

				const foundLangPairVendor = vendorBenchmarks.find(vendorBenchmark => vendorBenchmark.languagePair === languagePair)
				if(!foundLangPairVendor) {
					vendorBenchmarks.push({
						languagePair,
						sourceLanguage: sourceLanguage._id,
						targetLanguage: targetLanguage._id,
						industries: [{
							industry,
							stepInfo: [stepInfo]
						}]
					})
					return vendorBenchmarks
				}

				const foundIndustryVendor = foundLangPairVendor.industries.find(vendorBenchmark => vendorBenchmark.industry === industry)
				if(!foundIndustryVendor) {
					foundLangPairVendor.industries.push({
						industry,
						stepInfo: [stepInfo]
					})
					return vendorBenchmarks
				}

				const foundStepAndUtilVendor = foundIndustryVendor
						.stepInfo
						.find(vendorBenchmark => vendorBenchmark.step === step && vendorBenchmark.util === util)
				if(!foundStepAndUtilVendor) {
					foundStepAndUtilVendor.stepInfo.push(stepInfo)
					return vendorBenchmarks
				}

				foundStepAndUtilVendor.push(vendorInfo)
			})
		})
		return vendorBenchmarks
	}
}

module.exports = { saveVendorBenchmarkCost }