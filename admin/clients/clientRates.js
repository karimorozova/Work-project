const { Clients, Step, Services } = require('../models');
const ObjectId = require('mongodb').ObjectID;
const _ = require('lodash');
const { multiplyPrices, getArrayDifference } = require('../multipliers');
const {
  updateClientLangPairs,
  updateClientStepMultipliers,
  updateClientIndustryMultipliers,
  filterRedundantSteps,
  filterRedundantIndustries
} = require('./editClientRates');

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

//TODO: Add source-language existence check
const addNewRateComponents = async (clientId, newService) => {
  const { rates } = await Clients.findOne({ _id: clientId });
  const { sourceLanguage, targetLanguages } = newService;
  let { basicPricesTable, stepMultipliersTable, industryMultipliersTable, pricelistTable } = rates;
  const { uniqueServiceSteps, uniqueIndustries } = await getUniqueServiceItems(newService, rates);
  for (let { _id } of targetLanguages) {
    basicPricesTable.push({
      type: sourceLanguage._id.toString() === _id ? 'Mono' : 'Duo',
      sourceLanguage: sourceLanguage._id,
      targetLanguage: _id
    });
  }
  if (uniqueServiceSteps.length) {
    for (let service of uniqueServiceSteps) {
      stepMultipliersTable.push(...await getStepMultipliersCombinations(service));
    }
  }
  if (uniqueIndustries.length) {
    for (let { _id } of uniqueIndustries) {
      industryMultipliersTable.push({
        industry: _id
      });
    }
  }
  pricelistTable = await getPricelistCombinations(
    basicPricesTable,
    stepMultipliersTable,
    industryMultipliersTable,
    pricelistTable,
  );
  await Clients.updateOne({ _id: clientId },
    { rates: { basicPricesTable, stepMultipliersTable, industryMultipliersTable, pricelistTable } }
  );
};

const getUniqueServiceItems = async (newService, rates) => {
  const { services: newServices, industries: newIndustries } = newService;
  const { stepMultipliersTable, industryMultipliersTable } = rates;
  const newStepUnitCombination = getStepUnitCombinations(newServices);
  const currentIndustries = industryMultipliersTable.map(item => item.industry);
  const currentStepUnitCombinations = stepMultipliersTable.map(({ step, unit }) => `${step} - ${unit}`);
  let uniqueServiceStepsCombinations = newStepUnitCombination.length ?
    newStepUnitCombination.filter(item => !currentStepUnitCombinations.includes(item))
    : [];
  const uniqueServiceSteps = [];
  if (uniqueServiceStepsCombinations.length) {
    uniqueServiceStepsCombinations = uniqueServiceStepsCombinations.map(item => item.split(' ')[0]);
    for (let id of uniqueServiceStepsCombinations) {
      const neededStep = await Step.findOne({ _id: ObjectId(id) });
      uniqueServiceSteps.push(neededStep);
    }
  }
  const uniqueIndustries = newIndustries.filter(industry => !currentIndustries.includes(industry._id));
  return {
    uniqueServiceSteps,
    uniqueIndustries
  };
};

const getStepUnitCombinations = (newServices) => {
  const stepUnitCombinations = [];
  for (let { steps } of newServices) {
    for (let { step } of steps) {
      const { _id, calculationUnit } = step;
      for (let { _id: unitId } of calculationUnit) {
        stepUnitCombinations.push(`${_id} - ${unitId}`);
      }
    }
  }
  return Array.from(new Set(stepUnitCombinations));
};

//TODO: Add clients currencies for combinations
const getStepMultipliersCombinations = async ({ _id }) => {
  const stepUnitSizeCombinations = [];
  const { calculationUnit } = await Step.findOne({ _id });
  if (!calculationUnit.length) {
    return [];
  } else {
    for (let { _id: unitId, sizes } of calculationUnit) {
      if (sizes.length) {
        sizes.forEach(size => {
          stepUnitSizeCombinations.push({
            step: _id,
            unit: unitId,
            size
          });
        });
      } else {
        stepUnitSizeCombinations.push({
          step: _id,
          unit: unitId,
          size: 1,
          defaultSize: true,
        });
      }
    }
  }
  return stepUnitSizeCombinations;
};

const getPricelistCombinations = async (
  basicPricesTable,
  stepMultipliersTable,
  industryMultipliersTable,
  oldPricelistTable,
) => {
  const allPricelistCombinations = [];
  for (let { step, unit, size, multiplier: stepMultiplierValue } of stepMultipliersTable) {
    for (let { sourceLanguage, targetLanguage, basicPrice } of basicPricesTable) {
      for (let { industry, multiplier: industryMultiplierValue } of industryMultipliersTable) {
        allPricelistCombinations.push({
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
  // console.log({ basicPricesTable,
  //   stepMultipliersTable,
  //   industryMultipliersTable, allPricelistCombinations })
  console.log({ allPricelistCombinations, oldPricelistTable })
  allPricelistCombinations.push(...oldPricelistTable);
  return _.uniqBy(allPricelistCombinations, (item) => (
    item.sourceLanguage.toString() +
    item.targetLanguage.toString() +
    item.step.toString() +
    item.unit.toString() +
    item.size +
    item.industry.toString()
  ));
};

const getServiceDifferences = async (clientId, updatedService, oldService) => {
  const sourceLangDifference = getObjDifferences(updatedService.sourceLanguage, oldService.sourceLanguage);
  const targetLangDifference = getArrayDifference(oldService.targetLanguages, updatedService.targetLanguages, '_id');
  const serviceStepDifference = getArrayDifference(oldService.services, updatedService.services, '_id');
  const industryDifference = getArrayDifference(oldService.industries, updatedService.industries, '_id');
  if (sourceLangDifference.lang || targetLangDifference) {
    await updateClientLangPairs(
      oldService.sourceLanguage._id,
      sourceLangDifference,
      targetLangDifference,
      clientId,
      updatedService._id);
  }
  if (serviceStepDifference) {
    await updateClientStepMultipliers(serviceStepDifference, clientId, updatedService._id);
  }
  if (industryDifference) {
    await updateClientIndustryMultipliers(industryDifference, clientId, updatedService._id);
  }
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

const deleteClientRates = async (clientId, serviceToDelete) => {
  const client = await Clients.findOne({ _id: clientId });
  let { basicPricesTable, pricelistTable } = client.rates;
  let { sourceLanguage, targetLanguages, services: serviceIds, industries } = serviceToDelete;
  const services = [];
  for (let id of serviceIds) {
    const service = await Services.findOne({ _id: id });
    services.push(service);
  }
  const langPairsToDelete = targetLanguages.map(id => `${sourceLanguage} ${id}`);
  const industryIdsToDelete = industries.map(id => ({ _id: id.toString() }));
  basicPricesTable = basicPricesTable.filter(({ sourceLanguage, targetLanguage }) => (
    !langPairsToDelete.includes(`${sourceLanguage.toString()} ${targetLanguage.toString()}`)
  ));
  const { stepMultipliersTable: filteredStepsTable } = filterRedundantSteps(
    client.rates,
    client.services,
    serviceToDelete._id,
    services
  );
  const { industryMultipliersTable: filteredIndustriesTable } = filterRedundantIndustries(
    client.rates,
    client.services,
    serviceToDelete._id,
    industryIdsToDelete
  );
  pricelistTable = await getPricelistCombinations(
    basicPricesTable,
    filteredStepsTable,
    filteredIndustriesTable,
    pricelistTable,
    true
  );
  // console.log(pricelistTable);
  // await Clients.updateOne({ _id: clientId }, {
  //   rates: {
  //     basicPricesTable,
  //     stepMultipliersTable: filteredStepsTable,
  //     industryMultipliersTable: filteredIndustriesTable,
  //     pricelistTable
  //   }
  // });
};


module.exports = {
  updateClientRates,
  addNewRateComponents,
  getServiceDifferences,
  deleteClientRates,
};
