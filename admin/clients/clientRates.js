const { Clients, Step } = require('../models');

const updateClientRates = async (clientId, itemIdentifier, updatedItem) => {
  const client = await Clients.findOne({ _id: clientId });
  const { basicPricesTable, stepMultipliersTable, industryMultipliersTable } = client.rates;
  switch (itemIdentifier) {
    default:
    case 'Basic Price Table':
      const updatedBasicPriceTable = replaceOldItem(basicPricesTable, updatedItem);
      client.rates.basicPricesTable = updatedBasicPriceTable;
      await Clients.updateOne({ _id: clientId }, { rates: client.rates });
      break;
    case 'Step Multipliers Table':
      const updatedStepMultipliersTable = replaceOldItem(stepMultipliersTable, updatedItem);
      client.rates.stepMultipliersTable = updatedStepMultipliersTable;
      await Clients.updateOne({ _id: clientId }, { rates: client.rates });
      break;
    case 'Industry Multipliers Table':
      const updatedIndustryMultipliersTable = replaceOldItem(industryMultipliersTable, updatedItem);
      client.rates.industryMultipliersTable = updatedIndustryMultipliersTable;
      await Clients.updateOne({ _id: clientId }, { rates: client.rates });
      break;
  }
};

const replaceOldItem = (arr, replacementItem) => {
  const { _id } = replacementItem;
  const itemToUpdateIndex = findIndexToReplace(arr, _id);
  arr.splice(itemToUpdateIndex, 1, replacementItem);
  return arr;
};

const findIndexToReplace = (arr, searchItemId) => arr.findIndex(item => item._id.toString() === searchItemId);


//TODO: Add source-language existence check
const addNewRateComponents = async (clientId, newObj) => {
  const { sourceLanguage, targetLanguage, service, industry } = newObj;
  const client = await Clients.findOne({ _id: clientId });
  const { basicPricesTable, stepMultipliersTable, industryMultipliersTable } = client.rates;
  basicPricesTable.push({
    type: 'Duo',
    sourceLanguage: sourceLanguage._id,
    targetLanguage: targetLanguage._id
  });
  const stepMultipliersCombinations = await getStepMultipliersCombinations(service);
  stepMultipliersTable.push(...stepMultipliersCombinations);
  industryMultipliersTable.push({
    industry: industry._id
  });
  await Clients.updateOne({ _id: clientId },
    { rates: { basicPricesTable, stepMultipliersTable, industryMultipliersTable } }
  );
};

//TODO: Add clients currencies for combinations
const getStepMultipliersCombinations = async ({ steps }) => {
  const stepUnitSizeCombinations = [];
  for (let { step } of steps) {
    const { calculationUnit } = await Step.findOne({ _id: step });
    if (!calculationUnit.length) {
      return [];
    } else {
      for (let { _id, sizes } of calculationUnit) {
        if (sizes.length) {
          sizes.forEach(size => {
            stepUnitSizeCombinations.push({
              step: step._id,
              unit: _id,
              size
            });
          });
        } else {
          stepUnitSizeCombinations.push({
            step: step._id,
            unit: _id,
            size: 1
          });
        }
      }
    }
  }
  return stepUnitSizeCombinations;
};

module.exports = { updateClientRates, addNewRateComponents };
