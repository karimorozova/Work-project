const { getFilteredStepMultiplier, updateStepMultipliers, updateStepPriceValue } = require('./stepMultipiers');
const { getFilteredBasicPrices, updateBasicPrices, updateBasicPriceValue } = require('./basicPrice');
const { updateIndustryMultipliers } = require('./industryMultipliers');
const { getPricelistCombinations, addNewMultiplier } = require('./pricelist');

module.exports = {
  getFilteredBasicPrices,
  updateBasicPrices,
  updateBasicPriceValue,
  getFilteredStepMultiplier,
  updateStepMultipliers,
  updateStepPriceValue,
  updateIndustryMultipliers,
  getPricelistCombinations,
  addNewMultiplier,
}
