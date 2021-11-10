const { differenceOperationType } = require('./differenceOperationType');
const { tableKeys } = require('./ratesTableKeys');
const { defaultFinanceObj } = require('./defaultFinanceObj');
const { langTierIndustries } = require('./langTierIndustries');
const { dr1Instructions,  dr2Instructions, drInstructionsCompliance } = require('./deliveryInstructions');
const { instructions } = require('./serviceInstructions')

module.exports = {
  differenceOperationType,
  tableKeys,
  defaultFinanceObj,
  langTierIndustries,
  dr1Instructions,
  dr2Instructions,
  drInstructionsCompliance,
  instructions,
};
