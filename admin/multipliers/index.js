const { getFilteredStepMultiplier, updateStepMultipliers } = require('./stepMultipiers');
const { getFilteredBasicPrices, updateBasicPrices } = require('./basicPrice');
const { updateIndustryMultipliers } = require('./industryMultipliers');
const { getPricelistCombinations, addNewMultiplier } = require('./pricelist');

module.exports = {
  getFilteredBasicPrices,
  updateBasicPrices,
  getFilteredStepMultiplier,
  updateStepMultipliers,
  updateIndustryMultipliers,
  getPricelistCombinations,
  addNewMultiplier
}
