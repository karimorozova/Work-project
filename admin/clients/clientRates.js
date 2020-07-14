const { Clients, Step } = require('../models');
const ObjectId = require('mongodb').ObjectID;
const _ = require('lodash');

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
const addNewRateComponents = async (clientId, newObj, serviceId) => {
  const { sourceLanguage, targetLanguage, service, industry } = newObj;
  const client = await Clients.findOne({ _id: clientId });
  const { basicPricesTable, stepMultipliersTable, industryMultipliersTable } = client.rates;
  basicPricesTable.push({
    serviceId: serviceId.toString(),
    type: 'Duo',
    sourceLanguage: sourceLanguage._id,
    targetLanguage: targetLanguage._id
  });
  const stepMultipliersCombinations = await getStepMultipliersCombinations(service, serviceId);
  stepMultipliersTable.push(...stepMultipliersCombinations);
  industryMultipliersTable.push({
    serviceId: serviceId.toString(),
    industry: industry._id
  });
  const pricelistTable = getPricelistCombinations(basicPricesTable, stepMultipliersTable, industryMultipliersTable);
  await Clients.updateOne({ _id: clientId },
    { rates: { basicPricesTable, stepMultipliersTable, industryMultipliersTable } }
  );
};

//TODO: Add clients currencies for combinations
const getStepMultipliersCombinations = async ({ steps }, serviceId) => {
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
              serviceId: serviceId.toString(),
              step: step._id,
              unit: _id,
              size
            });
          });
        } else {
          stepUnitSizeCombinations.push({
            serviceId: serviceId.toString(),
            step: step._id,
            unit: _id,
            size: 1,
            defaultSize: true,
          });
        }
      }
    }
  }
  return stepUnitSizeCombinations;
};

const getPricelistCombinations = (basicPricesTable, stepMultipliersTable, industryMultipliersTable) => {
  const priceListCombinations = [];
  stepMultipliersTable.forEach(({ step, serviceId, unit, size, multiplier: stepMultiplierValue, euroMinPrice }) => {
    basicPricesTable.forEach(({ sourceLanguage, targetLanguage, euroBasicPrice }) => {
      industryMultipliersTable.forEach(({ industry, multiplier: industryMultiplierValue }) => {
        priceListCombinations.push({
          sourceLanguage,
          targetLanguage,
          step,
          unit,
          size,
          industry: industry.name,
          eurPrice: multiplyPrices(euroBasicPrice, stepMultiplierValue, industryMultiplierValue),
          euroMinPrice,
          isGrouped: false,
          serviceId: serviceId,
        });
      });
    });
  });
};

const syncClientRatesAndServices = async (clientId, changedData, oldData) => {
  const client = await Clients.findOne({ _id: clientId });
  let { basicPricesTable, stepMultipliersTable, industryMultipliersTable } = client.rates;
  const neededBasicPriceIndex = basicPricesTable.findIndex(item => item.serviceId === changedData._id);
  const neededIndustryIndex = industryMultipliersTable.findIndex(item => item.serviceId === changedData._id);
  const difference = getObjDifferences(changedData, oldData);
  if (difference.sourceLanguage) {
    client.rates.basicPricesTable[neededBasicPriceIndex].sourceLanguage = ObjectId(difference.sourceLanguage);
  } else if (difference.targetLanguage) {
    client.rates.basicPricesTable[neededBasicPriceIndex].targetLanguage = ObjectId(difference.targetLanguage);
  } else if (difference.service) {
    stepMultipliersTable = stepMultipliersTable.filter(item => item.serviceId !== changedData._id);
    const stepMultipliersCombinations = await getStepMultipliersCombinations(changedData.service, oldData._id);
    stepMultipliersTable.push(...stepMultipliersCombinations);
    client.rates.stepMultipliersTable = stepMultipliersTable;
  } else {
    client.rates.industryMultipliersTable[neededIndustryIndex].industry = ObjectId(difference.industry);
  }
  await Clients.updateOne({ _id: clientId }, { rates: client.rates });
};

const getObjDifferences = (obj1, obj2) => {
  let diffs = {};
  let key;
  const compare = (item1, item2, key) => {
    item1 = item1._id ? item1._id : item1;
    if (item1.toString() !== item2.toString()) {
      diffs[key] = item1.toString();
    }
  };
  for (key in obj1) {
    if (obj1.hasOwnProperty(key)) {
      compare(obj1[key], obj2[key], key);
    }
  }
  return diffs;
};

const deleteClientRates = async (clientId, serviceId) => {
  const client = await Clients.findOne({ _id: clientId });
  let { basicPricesTable, stepMultipliersTable, industryMultipliersTable } = client.rates;
  basicPricesTable = basicPricesTable.filter(item => item.serviceId !== serviceId);
  stepMultipliersTable = stepMultipliersTable.filter(item => item.serviceId !== serviceId);
  industryMultipliersTable = industryMultipliersTable.filter(item => item.serviceId !== serviceId);
  client.rates = { basicPricesTable, stepMultipliersTable, industryMultipliersTable };
  await Clients.updateOne({ _id: clientId }, { rates: client.rates });
};

module.exports = { updateClientRates, addNewRateComponents, syncClientRatesAndServices, deleteClientRates };
