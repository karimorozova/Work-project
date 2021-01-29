const { Pricelist, VendorBenchmarkCost, Vendors } = require('../models')
const { multiplyPrices } = require('../multipliers')

const updateVendorBenchmarkCost = async () => {

	const priceInfo = await Pricelist.findOne({ isActive: true })
			.populate('basicPricesTable.sourceLanguage', 'lang')
			.populate('basicPricesTable.targetLanguage', 'lang')

	const allVendors = await Vendors.find({ 'rates.pricelistTable': { $exists: true, $not: { $size: 0 } }, status: "Active" })
			.populate('rates.pricelistTable.sourceLanguage', 'lang')
			.populate('rates.pricelistTable.targetLanguage', 'lang')
			.populate('rates.pricelistTable.step', 'title')
			.populate('rates.pricelistTable.unit', 'type')

	const allBenchmarks = getBenchmarks(priceInfo)
	const vendorBenchmarks = getVendorBenchmarkCost(allVendors, allBenchmarks)
	await VendorBenchmarkCost.deleteMany()
	await VendorBenchmarkCost.create(vendorBenchmarks)
	return vendorBenchmarks

	function getBenchmarks(priceInfo) {
		const { basicPricesTable, industryMultipliersTable, stepMultipliersTable } = priceInfo
		let result = {}
		basicPricesTable.forEach(({ sourceLanguage, targetLanguage, euroBasicPrice }) => {
			const langPair = sourceLanguage._id + '/' + targetLanguage._id
			result[langPair] = {}
			industryMultipliersTable.forEach(({ industry, multiplier: industryMultiplierValue }) => {
				result[langPair][industry] = {}
				stepMultipliersTable.forEach(({ step, unit, size, multiplier: stepMultiplierValue }) => {
					const rate = multiplyPrices(euroBasicPrice, stepMultiplierValue, size, industryMultiplierValue)
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

				const languagePair = sourceLanguage._id + '/' + targetLanguage._id
				const stepAndUnitInfo = step._id + '/' + unit._id
				if (!allBenchmarks[languagePair]) return
				const benchmark = (allBenchmarks[languagePair][industry][stepAndUnitInfo] * 0.5).toFixed(3)
				const vendorInfo = {
					baseRate: price,
					margin: (benchmark - price).toFixed(3),
					vendorName: vendor.aliases.length ? vendor.aliases[0] : vendor.firstName,
					vendor: vendor._id
				}
				const stepInfo = {
					step: step._id,
					unit: unit._id,
					benchmark,
					vendorInfo: [vendorInfo]
				}

				const foundLangPairVendor = vendorBenchmarks.find(vendorBenchmark => vendorBenchmark.languagePair === languagePair)
				if (!foundLangPairVendor) {
					vendorBenchmarks.push({
						vendor: vendor._id,
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

				const foundIndustryVendor = foundLangPairVendor.industries.find(vendorBenchmark => vendorBenchmark.industry.toString() === industry.toString())
				if (!foundIndustryVendor) {
					foundLangPairVendor.industries.push({
						industry,
						stepInfo: [stepInfo]
					})
					return vendorBenchmarks
				}

				const foundStepAndUtilVendor = foundIndustryVendor
						.stepInfo
						.find(vendorBenchmark => vendorBenchmark.step === step._id && vendorBenchmark.unit === unit._id)
				if (!foundStepAndUtilVendor) {
					foundIndustryVendor.stepInfo.push(stepInfo)
					return vendorBenchmarks
				}

				foundStepAndUtilVendor.vendorInfo.push(vendorInfo)
			})
		})
		return vendorBenchmarks
	}
}

const getVendorBenchmarkCost = async (filters) => {
	let { sourceFilter, targetFilter, vendorFilter, stepFilter, unitFilter, industryFilter} = filters
	let VendorsBenchmarkInfo = await VendorBenchmarkCost.find()
			.populate('sourceLanguage', 'lang')
			.populate('targetLanguage', 'lang')
			.populate('industries.industry', 'name')
			.populate('industries.stepInfo.step', 'title')
			.populate('industries.stepInfo.unit', 'type')

	const allSourceLang = new Set().add("All")
	const allTargetLang = new Set().add("All")
	const allIndustries = new Set().add("All")
	const allVendors = new Set().add("All")
	const allSteps = new Set().add("All")
	const allUnits = new Set().add("All")

	VendorsBenchmarkInfo
			.forEach(({ sourceLanguage, targetLanguage, industries }) => {
				allSourceLang.add(sourceLanguage.lang)
				allTargetLang.add(targetLanguage.lang)
				industries.forEach(({ industry, stepInfo }) => {
					allIndustries.add(industry.name)
					stepInfo.forEach(({ vendorInfo, step, unit }) => {
						allSteps.add(step.title)
						allUnits.add(unit.type)
						vendorInfo.forEach(({ vendorName }) => {
							allVendors.add(vendorName)
						})
					})
				})
			})

	if (sourceFilter) {
		VendorsBenchmarkInfo = VendorsBenchmarkInfo.filter(({ sourceLanguage }) => sourceLanguage.lang === sourceFilter);
	}

	if (targetFilter) {
		VendorsBenchmarkInfo = VendorsBenchmarkInfo.filter(({ targetLanguage }) => targetLanguage.lang === targetFilter);
	}

	if (vendorFilter) {
		VendorsBenchmarkInfo = VendorsBenchmarkInfo.map(vendorsBenchmark => {
			vendorsBenchmark.industries =  vendorsBenchmark.industries.map((benchmarkIndustry) =>  {
				benchmarkIndustry.stepInfo = benchmarkIndustry.stepInfo.map((benchmarkVendor ) =>{
					benchmarkVendor.vendorInfo = benchmarkVendor.vendorInfo.filter(({ vendorName }) => vendorName === vendorFilter)
					return benchmarkVendor
				}).filter(({vendorInfo}) => vendorInfo.length)
				return benchmarkIndustry
			}).filter(({stepInfo}) => stepInfo.length)
			return vendorsBenchmark;
		});
	}

	if (industryFilter) {
		VendorsBenchmarkInfo = VendorsBenchmarkInfo.map(vendorsBenchmark => {
			vendorsBenchmark.industries =  vendorsBenchmark.industries.filter(({ industry }) => industry.name === industryFilter)
			return vendorsBenchmark;
		});
	}

	if (stepFilter) {
		VendorsBenchmarkInfo = VendorsBenchmarkInfo.map(vendorsBenchmark => {
			vendorsBenchmark.industries =  vendorsBenchmark.industries.map((benchmarkIndustry) =>  {
				benchmarkIndustry.stepInfo = benchmarkIndustry.stepInfo.filter(({ step }) => step.title === stepFilter)
				return benchmarkIndustry
			})
			return vendorsBenchmark;
		});
	}

	if (unitFilter) {
		VendorsBenchmarkInfo = VendorsBenchmarkInfo.map(vendorsBenchmark => {
			vendorsBenchmark.industries =  vendorsBenchmark.industries.map((benchmarkIndustry) =>  {
				benchmarkIndustry.stepInfo = benchmarkIndustry.stepInfo.filter(({ unit }) => unit.type === unitFilter)
				return benchmarkIndustry
			})
			return vendorsBenchmark;
		});
	}

	const benchmarkFilters = {
		allSourceLang: Array.from(allSourceLang),
		allTargetLang: Array.from(allTargetLang),
		allIndustries: Array.from(allIndustries),
		allVendors: Array.from(allVendors),
		allSteps: Array.from(allSteps),
		allUnits: Array.from(allUnits),
	}

	return { vendorInfo: VendorsBenchmarkInfo.filter(({industries}) => industries.length), benchmarkFilters }
}

module.exports = { updateVendorBenchmarkCost, getVendorBenchmarkCost }