const {
	getFilteredStepMultiplier,
	updateStepMultipliers,
	updateStepPriceValue
} = require('./stepMultipiers')

const {
	getFilteredBasicPrices,
	updateBasicPrices,
	updateBasicPriceValue,
	pushNewLangs
} = require('./basicPrice')

const {
	updateIndustryMultipliers
} = require('./industryMultipliers')

const {
	getPricelistCombinations,
	addNewMultiplier,
	updateMultiplier,
	getPercentage,
	multiplyPrices,
	arrayComparer,
	getArrayDifference,
	updatePriceMultiplier,
	setHideAndShowOption
} = require('./pricelist')

module.exports = {
	setHideAndShowOption,
	getFilteredBasicPrices,
	updateBasicPrices,
	updateBasicPriceValue,
	getFilteredStepMultiplier,
	updateStepMultipliers,
	updateStepPriceValue,
	updateIndustryMultipliers,
	getPricelistCombinations,
	addNewMultiplier,
	updateMultiplier,
	getPercentage,
	multiplyPrices,
	arrayComparer,
	getArrayDifference,
	updatePriceMultiplier,
	pushNewLangs
}
