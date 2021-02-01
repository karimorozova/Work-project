const { Vendors, Pricelist } = require('../models')
const { tableKeys } = require('../enums')
const {
	synchronizeBasicPrice,
	synchronizeStepMultiplier,
	synchronizeIndustryMultiplier,
	synchronizePricelistTable
} = require('../clients')

const syncVendorRatesCost = async (vendorId, tableKey, row) => {
	const { currency, rates } = await Vendors.findOne({ _id: vendorId })
	const {
		basicPricesTable,
		stepMultipliersTable,
		industryMultipliersTable
	} = await Pricelist.findOne({ isVendorDefault: true })

	switch (tableKey) {
		case tableKeys.basicPricesTable:
			await synchronizeBasicPrice(row, basicPricesTable, rates, vendorId, currency, true)
			break
		case tableKeys.stepMultipliersTable:
			await synchronizeStepMultiplier(row, stepMultipliersTable, rates, vendorId, true)
			break
		case tableKeys.industryMultipliersTable:
			await synchronizeIndustryMultiplier(row, industryMultipliersTable, rates, vendorId, true)
			break
		case tableKeys.pricelistTable:
			await synchronizePricelistTable(row, rates, vendorId, true)
			break
	}
}

module.exports = { syncVendorRatesCost }
