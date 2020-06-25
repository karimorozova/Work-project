const { getFilteredStepMultiplier, updateStepMultipliers } = require('./stepMultipiers');
const { getFilteredBasicPrices, updateBasicPrices } = require('./basicPrice');
const { updateIndustryMultipliers } = require('./industryMultipliers');

module.exports = {
  getFilteredBasicPrices,
  updateBasicPrices,
  getFilteredStepMultiplier,
  updateStepMultipliers,
  updateIndustryMultipliers
}
