const { Vendors } = require('../models');
const { getPricelistCombinations } = require('../clients');

const deleteVendorRates = async (vendorId, competenceToDelete) => {
  const vendor = await Vendors.findOne({ _id: vendorId });
  let { basicPricesTable, stepMultipliersTable, industryMultipliersTable, pricelistTable } = vendor.rates;
  let { sourceLanguage, targetLanguage, step, industry } = competenceToDelete;
  basicPricesTable = basicPricesTable.filter(item => (
    `${item.sourceLanguage} ${item.targetLanguage}` !== `${sourceLanguage} ${targetLanguage}`
  ));
  stepMultipliersTable = stepMultipliersTable.filter(item => item.step.toString() !== step.toString());
  industryMultipliersTable = industryMultipliersTable.filter(item => item.industry.toString() !== industry.toString());
  pricelistTable = await getPricelistCombinations(
    basicPricesTable,
    stepMultipliersTable,
    industryMultipliersTable,
    pricelistTable,
    true);
  return {
    rates: {
      basicPricesTable,
      stepMultipliersTable,
      industryMultipliersTable,
      pricelistTable
    }
  };
};

module.exports = {
  deleteVendorRates
};
