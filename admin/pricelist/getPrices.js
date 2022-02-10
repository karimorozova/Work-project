const { Pricelist } = require("../models")

async function getPricelist(obj) {
	return await Pricelist.findOne(obj)
			.populate('industryMultipliersTable.industry')
			.populate('stepMultipliersTable.step')
			.populate('stepMultipliersTable.unit')
			.populate('basicPricesTable.sourceLanguage')
			.populate('basicPricesTable.targetLanguage')
}

async function getPricelists(obj) {
	return await Pricelist.find(obj)
			.populate('industryMultipliersTable.industry')
			.populate('stepMultipliersTable.step')
			.populate('stepMultipliersTable.unit')
			.populate('basicPricesTable.sourceLanguage')
			.populate('basicPricesTable.targetLanguage')
}

async function getUpdatedPricelist(query, update) {
	return await Pricelist.findOneAndUpdate(query, update, { new: true })
			.populate('industryMultipliersTable.industry')
			.populate('stepMultipliersTable.step')
			.populate('stepMultipliersTable.unit')
			.populate('basicPricesTable.sourceLanguage')
			.populate('basicPricesTable.targetLanguage')
}

module.exports = { getPricelist, getPricelists, getUpdatedPricelist }
