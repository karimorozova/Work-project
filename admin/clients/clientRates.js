const { Clients, Step } = require('../models');
const ObjectId = require('mongodb').ObjectID;
const { multiplyPrices } = require('../multipliers');
const _ = require('lodash');

const updateClientRates = async (clientId, itemIdentifier, updatedItem) => {
  const client = await Clients.findOne({ _id: clientId });
  const { basicPricesTable, stepMultipliersTable, industryMultipliersTable, pricelistTable } = client.rates;
  let updatedPricelistTable;
  switch (itemIdentifier) {
    default:
    case 'Basic Price Table':
      const updatedBasicPriceTable = replaceOldItem(basicPricesTable, updatedItem);
      updatedPricelistTable = changePricelistTable(
        basicPricesTable,
        stepMultipliersTable,
        industryMultipliersTable,
        pricelistTable,
        updatedItem,
        itemIdentifier
      );
      client.rates.basicPricesTable = updatedBasicPriceTable;
      client.rates.pricelistTable = updatedPricelistTable;
      await Clients.updateOne({ _id: clientId }, { rates: client.rates });
      break;
    case 'Step Multipliers Table':
      const updatedStepMultipliersTable = replaceOldItem(stepMultipliersTable, updatedItem);
      updatedPricelistTable = changePricelistTable(
        basicPricesTable,
        stepMultipliersTable,
        industryMultipliersTable,
        pricelistTable,
        updatedItem,
        itemIdentifier
      );
      client.rates.stepMultipliersTable = updatedStepMultipliersTable;
      client.rates.pricelistTable = updatedPricelistTable;
      await Clients.updateOne({ _id: clientId }, { rates: client.rates });
      break;
    case 'Industry Multipliers Table':
      const updatedIndustryMultipliersTable = replaceOldItem(industryMultipliersTable, updatedItem);
      updatedPricelistTable = changePricelistTable(
        basicPricesTable,
        stepMultipliersTable,
        industryMultipliersTable,
        pricelistTable,
        updatedItem,
        itemIdentifier
      );
      client.rates.industryMultipliersTable = updatedIndustryMultipliersTable;
      client.rates.pricelistTable = updatedPricelistTable;
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

const changePricelistTable = (
  basicPricesTable,
  stepMultipliersTable,
  industryMultipliersTable,
  pricelistTable,
  updatedItem,
  key) => {
  let changedPricelistTable = [];
  for (let item of pricelistTable) {
    if (!item.altered && item.serviceId === updatedItem.serviceId) {
      const neededBasicPriceItem = basicPricesTable.find(basicPrice => basicPrice.serviceId === updatedItem.serviceId);
      const neededStepMultipliersItem = stepMultipliersTable.find(({ step, unit, serviceId, size }) => (
        step.toString() === item.step.toString() &&
        unit.toString() === item.unit.toString() &&
        serviceId === item.serviceId &&
        size === item.size
      ));
      const neededIndustryItem = industryMultipliersTable.find(industry => industry.serviceId === updatedItem.serviceId);
      switch (key) {
        default:
        case 'Basic Price Table':
          item.price = multiplyPrices(
            updatedItem.basicPrice, neededStepMultipliersItem.multiplier, neededIndustryItem.multiplier
          );
          changedPricelistTable.push(item);
          break;
        case 'Step Multipliers Table':
          const neededPricelistItem = item.step.toString() === updatedItem.step._id &&
          item.unit.toString() === updatedItem.unit._id &&
          item.serviceId === updatedItem.serviceId &&
          item.size === updatedItem.size ? item : undefined;
          if (neededPricelistItem) {
            item.price = multiplyPrices(
              neededBasicPriceItem.basicPrice, updatedItem.multiplier, neededIndustryItem.multiplier);
            changedPricelistTable.push(item);
          } else {
            changedPricelistTable.push(item);
          }
          break;
        case 'Industry Multipliers Table':
          item.price = multiplyPrices(
            neededBasicPriceItem.basicPrice, neededStepMultipliersItem.multiplier, updatedItem.multiplier
          );
          changedPricelistTable.push(item);
          break;
      }
    } else {
      changedPricelistTable.push(item);
    }
  }
  return changedPricelistTable;
};

const unifyServiceItems = (currServices, newService) => {
  const { sourceLanguage, targetLanguages, services: newServices, industries: newIndustries } = newService;
  const { langPairs, services, industries } = currServices;
  for (let { _id } of targetLanguages) {
    langPairs.push({
      source: sourceLanguage._id,
      target: _id
    });
  }
  for (let { _id } of newServices) {
    services.push(_id);
  }
  for (let { _id } of newIndustries) {
    industries.push(_id);
  }
  return {
    langPairs,
    services,
    industries
  };
};

const syncUnifiedServiceItems = (currServices, updatedService) => {

};

//TODO: Add source-language existence check
const addNewRateComponents = async (clientId, newService, serviceId) => {
  const { servicesForUnification } = await Clients.findOne({ _id: clientId });
  const { sourceLanguage, targetLanguages, services: newServices, industries: newIndustries } = newService;
  const { services, industries } = servicesForUnification;
  const newUniqueServices = newServices.filter(item => !services.includes(item._id));
  const newUniqueIndustries = newIndustries.filter(item => !industries.includes(item._id));
  const { basicPricesTable, stepMultipliersTable, industryMultipliersTable, pricelistTable } = client.rates;
  for (let { _id } of targetLanguages) {
    basicPricesTable.push({
      serviceId: serviceId.toString(),
      type: 'Duo',
      sourceLanguage: sourceLanguage._id,
      targetLanguage: _id
    });
  }
  if (newUniqueServices.length) {
    for (let service of newUniqueServices) {
      stepMultipliersTable.push(await getStepMultipliersCombinations(service, serviceId));
    }
  }
  if (newUniqueIndustries.length) {
    for (let { _id } of newUniqueIndustries) {
      industryMultipliersTable.push({
        serviceId: serviceId.toString(),
        industry: _id
      });
    }
  }
  pricelistTable.push(
    ...getPricelistCombinations(
      basicPricesTable,
      stepMultipliersTable,
      industryMultipliersTable,
      serviceId
    ));
  await Clients.updateOne({ _id: clientId },
    { rates: { basicPricesTable, stepMultipliersTable, industryMultipliersTable, pricelistTable } }
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

const getPricelistCombinations = (basicPricesTable, stepMultipliersTable, industryMultipliersTable, serviceId) => {
  const priceListCombinations = [];
  const newBasicPriceItems = basicPricesTable.filter(item => item.serviceId.toString() === serviceId.toString());
  const newStepMultiplierItems = stepMultipliersTable.filter(item => (
    item.serviceId.toString() === serviceId.toString()
  ));
  const newIndustryMultiplierItems = industryMultipliersTable.filter(item => (
    item.serviceId.toString() === serviceId.toString()
  ));
  for (let { step, serviceId, unit, size, multiplier: stepMultiplierValue } of newStepMultiplierItems) {
    for (let { sourceLanguage, targetLanguage, basicPrice } of newBasicPriceItems) {
      for (let { industry, multiplier: industryMultiplierValue } of newIndustryMultiplierItems) {
        priceListCombinations.push({
          serviceId: serviceId.toString(),
          sourceLanguage,
          targetLanguage,
          step,
          unit,
          size,
          industry,
          price: multiplyPrices(basicPrice, stepMultiplierValue, industryMultiplierValue),
        });
      }
    }
  }
  return priceListCombinations;
};

const syncClientRatesAndServices = async (clientId, changedData, oldData) => {
  const client = await Clients.findOne({ _id: clientId });
  let { basicPricesTable, stepMultipliersTable, industryMultipliersTable, pricelistTable } = client.rates;
  const neededBasicPriceIndex = basicPricesTable.findIndex(item => item.serviceId === changedData._id);
  const neededIndustryIndex = industryMultipliersTable.findIndex(item => item.serviceId === changedData._id);
  const difference = getObjDifferences(changedData, oldData);
  if (difference.sourceLanguage) {
    const sameLanguagePair = doesHaveSameLanguagePair(
      basicPricesTable,
      changedData.sourceLanguage._id,
      changedData.targetLanguage._id
    );
    if (sameLanguagePair) {
      client.rates.basicPricesTable.splice(neededBasicPriceIndex, 1);
      client.rates.pricelistTable = pricelistTable.filter(item => item.serviceId !== changedData._id);
    } else {
      client.rates.basicPricesTable[neededBasicPriceIndex].sourceLanguage = ObjectId(difference.sourceLanguage);
    }
  } else if (difference.targetLanguage) {
    const sameLanguagePair = doesHaveSameLanguagePair(
      basicPricesTable,
      changedData.sourceLanguage._id,
      changedData.targetLanguage._id
    );
    if (sameLanguagePair) {
      client.rates.basicPricesTable.splice(neededBasicPriceIndex, 1);

      client.rates.pricelistTable = pricelistTable.filter(item => item.serviceId !== changedData._id);

    } else {
      client.rates.basicPricesTable[neededBasicPriceIndex].targetLanguage = ObjectId(difference.targetLanguage);
    }
  } else if (difference.service) {
    const sameServiceSteps = await doesHaveSameService(client.services, changedData.service._id);
    stepMultipliersTable = stepMultipliersTable.filter(item => item.serviceId !== changedData._id);
    if (!sameServiceSteps) {
      const stepMultipliersCombinations = await getStepMultipliersCombinations(changedData.service, oldData._id);
      stepMultipliersTable.push(...stepMultipliersCombinations);
    }
    client.rates.stepMultipliersTable = stepMultipliersTable;
    client.rates.pricelistTable = pricelistTable.filter(item => item.serviceId === changedData._id);
  } else {
    const sameIndustry = industryMultipliersTable.find(item => (
      item.industry.toString() === changedData.industry._id.toString()
    ));
    if (sameIndustry) {
      client.rates.industryMultipliersTable.splice(neededIndustryIndex, 1);
      client.rates.pricelistTable = pricelistTable.filter(item => item.serviceId === changedData._id);
    } else {
      client.rates.industryMultipliersTable[neededIndustryIndex].industry = ObjectId(difference.industry);
    }
  }
  await Clients.updateOne({ _id: clientId }, { rates: client.rates });
};

const doesHaveSameLanguagePair = (arr, sourceLanguageId, targetLanguageId) => {
  return arr.find(item => item.sourceLanguage.toString() === sourceLanguageId.toString() &&
    item.targetLanguage.toString() === targetLanguageId.toString()
  );
};

const doesHaveSameService = async (services, settingsServiceId) => {
  return services.find(item => item.service.toString() === settingsServiceId);
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
  let { basicPricesTable, stepMultipliersTable, industryMultipliersTable, pricelistTable } = client.rates;
  basicPricesTable = basicPricesTable.filter(item => item.serviceId !== serviceId);
  stepMultipliersTable = stepMultipliersTable.filter(item => item.serviceId !== serviceId);
  industryMultipliersTable = industryMultipliersTable.filter(item => item.serviceId !== serviceId);
  pricelistTable = pricelistTable.filter(item => item.serviceId !== serviceId);
  client.rates = { basicPricesTable, stepMultipliersTable, industryMultipliersTable, pricelistTable };
  await Clients.updateOne({ _id: clientId }, { rates: client.rates });
};

module.exports = {
  updateClientRates,
  addNewRateComponents,
  syncClientRatesAndServices,
  deleteClientRates,
  unifyServiceItems,
  syncUnifiedServiceItems
};
