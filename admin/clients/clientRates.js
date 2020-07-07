const { Clients } = require('../models');

const updateClientRates = async (clientId, itemIdentifier, updatedItem) => {
  const client = await Clients.findOne({ _id: clientId });
  const { basicPricesTable, stepMultipliersTable, industryMultipliersTable } = client.rates;
  switch (itemIdentifier) {
    default:
    case 'Basic Price Table':
      const updatedBasicPriceTable = replaceOldItem(basicPricesTable, updatedItem);
      await Clients.updateOne({ _id: clientId }, { basicPricesTable: updatedBasicPriceTable });
      break;
    case 'Step Multipliers Table':
      const updatedStepMultipliersTable = replaceOldItem(stepMultipliersTable, updatedItem);
      await Clients.updateOne({ _id: clientId }, { stepMultipliersTable: updatedStepMultipliersTable });
      break;
    case 'Industry Multipliers Table':
      const updatedIndustryMultipliersTable = replaceOldItem(industryMultipliersTable, updatedItem);
      await Clients.updateOne({ _id: clientId }, { industryMultipliersTable: updatedIndustryMultipliersTable });
      break;
  }
};

const replaceOldItem = (arr, replacementItem) => {
  const { _id } = replacementItem;
  const itemToUpdateIndex = findIndexToReplace(arr, _id);
  return arr.splice(itemToUpdateIndex, 1, replacementItem);
};

const findIndexToReplace = (arr, searchItemId) => arr.findIndex(item => item._id === searchItemId);

module.exports = { updateClientRates };
