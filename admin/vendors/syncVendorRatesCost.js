const { Vendors, Pricelist } = require('../models');
const { tableKeys } = require('../enums');
const {
  synchronizeBasicPrice,
  synchronizeStepMultiplier,
  synchronizeIndustryMultiplier,
  synchronizePricelistTable
} = require('../clients');

const syncVendorRatesCost = async (vendorId, tableKey, row) => {
  const { currency, rates } = await Vendors.findOne({ _id: vendorId });
  const {
    basicPricesTable,
    stepMultipliersTable,
    industryMultipliersTable,
  } = await Pricelist.findOne({ defaultPricelist: true });
  switch (tableKey) {
    default:
    case tableKeys.basicPricesTable:
      await synchronizeBasicPrice(row, basicPricesTable, rates, vendorId, currency);
      break;
    case tableKeys.stepMultipliersTable:
      await synchronizeStepMultiplier(row, stepMultipliersTable, rates, vendorId);
      break;
    case tableKeys.industryMultipliersTable:
      await synchronizeIndustryMultiplier(row, industryMultipliersTable, rates, vendorId);
      break;
    case tableKeys.pricelistTable:
      await synchronizePricelistTable(row, rates, vendorId);
  }
};

module.exports = { syncVendorRatesCost };
