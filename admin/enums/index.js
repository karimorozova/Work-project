const { differenceOperationType } = require('./differenceOperationType');
const { tableKeys } = require('./ratesTableKeys');
const { defaultFinanceObj } = require('./defaultFinanceObj');
const { langTierIndustries } = require('./langTierIndustries');
const { dr1Instructions,  dr2Instructions } = require('./deliveryInstructions');

module.exports = {
  differenceOperationType,
  tableKeys,
  defaultFinanceObj,
  langTierIndustries,
  dr1Instructions,
  dr2Instructions,
};
