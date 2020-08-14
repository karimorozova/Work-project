const { Clients, Step, Services, Pricelist } = require('../models');
const _ = require('lodash');
const { multiplyPrices, getArrayDifference } = require('../multipliers');
const {
  updateClientLangPairs,
  updateClientStepMultipliers,
  updateClientIndustryMultipliers,
  filterRedundantSteps,
  filterRedundantIndustries
} = require('./editClientRates');
const { tableKeys } = require('../enums');

const updateClientRates = async (clientId, itemIdentifier, updatedItem) => {
  const client = await Clients.findOne({ _id: clientId });
  const boundPricelist = await Pricelist.findOne({ isDefault: true });
  const { basicPricesTable, stepMultipliersTable, industryMultipliersTable, pricelistTable } = client.rates;
  let updatedPricelistTable;
  switch (itemIdentifier) {
    default:
    case tableKeys.basicPricesTable:
      const { basicPrice } = basicPricesTable.find(item => item._id.toString() === updatedItem._id.toString());
      if (basicPrice === Number(updatedItem.basicPrice)) return;
      const updatedBasicPriceTable = replaceOldItem(
        basicPricesTable,
        updatedItem,
        boundPricelist,
        tableKeys.basicPricesTable,
        'Client'
      );
      updatedPricelistTable = changePricelistTable(
        pricelistTable,
        updatedItem,
        itemIdentifier,
        basicPrice
      );
      client.rates.basicPricesTable = updatedBasicPriceTable;
      client.rates.pricelistTable = updatedPricelistTable;
      await Clients.updateOne({ _id: clientId }, { rates: client.rates });
      break;
    case tableKeys.stepMultipliersTable:
      const { multiplier: stepMultiplier } = stepMultipliersTable.find(item => item._id.toString() === updatedItem._id.toString());
      if (stepMultiplier === Number(updatedItem.multiplier)) return;
      const updatedStepMultipliersTable = replaceOldItem(
        stepMultipliersTable,
        updatedItem,
        boundPricelist,
        tableKeys.stepMultipliersTable,
        'Client'
      );
      updatedPricelistTable = changePricelistTable(
        pricelistTable,
        updatedItem,
        itemIdentifier,
        stepMultiplier
      );
      client.rates.stepMultipliersTable = updatedStepMultipliersTable;
      client.rates.pricelistTable = updatedPricelistTable;
      await Clients.updateOne({ _id: clientId }, { rates: client.rates });
      break;
    case tableKeys.industryMultipliersTable:
      const { multiplier: industryMultiplier } = industryMultipliersTable.find(item => item._id.toString() === updatedItem._id.toString());
      if (industryMultiplier === Number(updatedItem.multiplier)) return;
      const updatedIndustryMultipliersTable = replaceOldItem(
        industryMultipliersTable,
        updatedItem,
        boundPricelist,
        tableKeys.industryMultipliersTable,
        'Client'
      );
      updatedPricelistTable = changePricelistTable(
        pricelistTable,
        updatedItem,
        itemIdentifier,
        industryMultiplier
      );
      client.rates.industryMultipliersTable = updatedIndustryMultipliersTable;
      client.rates.pricelistTable = updatedPricelistTable;
      await Clients.updateOne({ _id: clientId }, { rates: client.rates });
      break;
  }
};

const replaceOldItem = (arr, replacementItem, boundPricelist, key, personKey) => {
  const { _id } = replacementItem;
  const { basicPricesTable, stepMultipliersTable, industryMultipliersTable } = boundPricelist;
  let altered;
  switch (key) {
    default:
    case tableKeys.basicPricesTable:
      const { sourceLanguage, targetLanguage } = replacementItem;
      const neededLangPair = getNeededLangPair(basicPricesTable, sourceLanguage._id, targetLanguage._id);
      altered = neededLangPair ? neededLangPair.altered : false;
      break;
    case tableKeys.stepMultipliersTable:
      const { step, unit, size } = replacementItem;
      const neededStepRow = getNeededStepRow(stepMultipliersTable, step, unit, size);
      altered = neededStepRow ? neededStepRow.altered : false;
      break;
    case tableKeys.industryMultipliersTable:
      const { industry } = replacementItem;
      const neededIndustryRow = industryMultipliersTable.find(item => (
        item.industry.toString() === industry._id.toString()
      ));
      altered = !!neededIndustryRow.altered;
  }
  if (altered) {
    replacementItem.notification = 'Pricelist data has been updated';
  } else {
    replacementItem.notification = `${personKey}'s data is different from pricelist`;
  }
  const itemToUpdateIndex = findIndexToReplace(arr, _id);
  arr.splice(itemToUpdateIndex, 1, replacementItem);
  return arr;
};

const findIndexToReplace = (arr, searchItemId) => arr.findIndex(item => item._id.toString() === searchItemId);

/**
 *
 * @param pricelistTable - {Array} - Array of client's pricelist
 * @param updatedItem - {Object} - Object with updated data
 * @param key - {String} - table identifier
 * @param oldMultiplier - {Number} - Old price or step/industry multiplier
 * @returns {Array} - returns pricelist with updated rows
 */
const changePricelistTable = (
  pricelistTable,
  updatedItem,
  key,
  oldMultiplier
) => {
  let updatedPricelist;
  switch (key) {
    default:
    case tableKeys.basicPricesTable:
      const { sourceLanguage, targetLanguage, basicPrice } = updatedItem;
      updatedPricelist = pricelistTable.map(item => {
        if (`${item.sourceLanguage} ${item.targetLanguage}` === `${sourceLanguage._id} ${targetLanguage._id}`) {
          item.price /= oldMultiplier;
          item.price *= Number(basicPrice);
        }
        return item;
      });
      break;
    case tableKeys.stepMultipliersTable:
      const { step, unit, size, multiplier: stepMultiplier } = updatedItem;
      updatedPricelist = pricelistTable.map(item => {
        if (`${item.step} ${item.unit} ${item.size}` === `${step._id} ${unit._id} ${size}`) {
          item.price /= oldMultiplier;
          item.price *= Number(stepMultiplier);
        }
        return item;
      });
      break;
    case tableKeys.industryMultipliersTable:
      const { industry, multiplier: industryMultiplier } = updatedItem;
      updatedPricelist = pricelistTable.map(item => {
        if (item.industry.toString() === industry._id) {
          item.price /= oldMultiplier;
          item.price *= Number(industryMultiplier);
        }
        return item;
      });
  }
  return updatedPricelist;
};

/**
 * @param clientId - id of a current client
 * @param newService - fresh created service, consists: {
 *   sourceLanguage: {Object},
 *   targetLanguages: {Array},
 *   services: {Array},
 *   industries: {Array}
 * }
 * @returns: Nothing, but updates client's rates with new combinations
 */
const addNewRateComponents = async (clientId, newService) => {
  const { rates, currency } = await Clients.findOne({ _id: clientId });

  const boundPricelist = await Pricelist.findOne({ isDefault: true});
  const { sourceLanguage, targetLanguages } = newService;
  let { basicPricesTable, stepMultipliersTable, industryMultipliersTable, pricelistTable } = rates;
  const { uniqueServiceSteps, uniqueIndustries } = await getUniqueServiceItems(newService, rates);
  const newSteps = [];
  for (let { steps } of newService.services) {
    for (let { step } of steps) {
      newSteps.push({ _id: step._id });
    }
  }
  const newIndustries = newService.industries.map(item => item._id);
  const newStepMultiplierCombinations = [];
  const newIndustryMultiplierCombinations = [];
  for (let step of newSteps) {
    newStepMultiplierCombinations.push(...await getStepMultipliersCombinations(step, boundPricelist));
  }
  for (let industry of newIndustries) {
    const neededIndustryRow = boundPricelist.industryMultipliersTable.find(item => (
      item.industry.toString() === industry.toString()
    ));
    const multiplier = neededIndustryRow.hasOwnProperty('multiplier') ? neededIndustryRow.multiplier : 100;
    newIndustryMultiplierCombinations.push({
      industry,
      multiplier
    });
  }
  const freshBasicPriceRows = [];
  for (let { _id } of targetLanguages) {
    const neededLangPair = getNeededLangPair(boundPricelist.basicPricesTable, sourceLanguage._id, _id);
    const boundBasicPrice = neededLangPair ? getNeededCurrency(neededLangPair, currency) : 1;
    const newBasicPriceObj = {
      type: sourceLanguage._id.toString() === _id ? 'Mono' : 'Duo',
      sourceLanguage: sourceLanguage._id,
      targetLanguage: _id,
      basicPrice: boundBasicPrice
    };
    basicPricesTable.push(newBasicPriceObj);
    freshBasicPriceRows.push(newBasicPriceObj);
  }
  if (uniqueServiceSteps.length) {
    for (let service of uniqueServiceSteps) {
      stepMultipliersTable.push(...await getStepMultipliersCombinations(service, boundPricelist));
    }
  }
  if (uniqueIndustries.length) {
    for (let { _id } of uniqueIndustries) {
      const neededIndustryRow = boundPricelist.industryMultipliersTable.find(({ industry }) => (
        industry.toString() === _id.toString()
      ));
      const multiplier = !!neededIndustryRow ? neededIndustryRow.multiplier : 100;
      industryMultipliersTable.push({
        industry: _id,
        multiplier
      });
    }
  }
  pricelistTable = await generateNewPricelistCombinations(
    freshBasicPriceRows,
    newStepMultiplierCombinations,
    newIndustryMultiplierCombinations,
    pricelistTable,
  );
  await Clients.updateOne({ _id: clientId },
    { rates: { basicPricesTable, stepMultipliersTable, industryMultipliersTable, pricelistTable } }
  );
};

const getNeededCurrency = (basicPriceObj, clientCurrency) => {
  const { euroBasicPrice, usdBasicPrice, gbpBasicPrice } = basicPriceObj;
  if (clientCurrency === 'EUR') {
    return euroBasicPrice;
  } else if (clientCurrency === 'USD') {
    return usdBasicPrice;
  } else {
    return gbpBasicPrice;
  }
};

const getNeededLangPair = (arr, sourceLangId, targetLangId) => (
  arr.find(item => (
    item.sourceLanguage.toString() === sourceLangId.toString() &&
    item.targetLanguage.toString() === targetLangId.toString()
  )));

const getNeededStepRow = (arr, step, unit, size) => (
  arr.find(item => (
    `${item.step} ${item.unit} ${item.size}` === `${step._id} ${unit._id} ${size}`
  ))
);

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
    uniqueServiceStepsCombinations = Array.from(new Set(uniqueServiceStepsCombinations));
    for (let id of uniqueServiceStepsCombinations) {
      const neededStep = await Step.findOne({ _id: id });
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
const getStepMultipliersCombinations = async ({ _id }, { stepMultipliersTable }) => {
  const stepUnitSizeCombinations = [];
  const { calculationUnit } = await Step.findOne({ _id });
  if (!calculationUnit.length) {
    return [];
  } else {
    for (let { _id: unitId } of calculationUnit) {
      const sizes = calculationUnit.hasOwnProperty('sizes') ? calculationUnit.sizes : [];
      if (sizes.length) {
        sizes.forEach(size => {
          const neededStepRow = stepMultipliersTable.find(item => (
            `${item.step} ${item.unit} ${item.size}` === `${_id} ${unitId} ${size}`
          ));
          const multiplier = !!neededStepRow ? neededStepRow.multiplier : 100;
          stepUnitSizeCombinations.push({
            step: _id,
            unit: unitId,
            size,
            multiplier
          });
        });
      } else {
        const neededStepRow = stepMultipliersTable.find(({ step, unit }) => (
          `${step} ${unit}` === `${_id} ${unitId}`
        ));
        const multiplier = !!neededStepRow ? neededStepRow.multiplier : 100;
        stepUnitSizeCombinations.push({
          step: _id,
          unit: unitId,
          size: 1,
          defaultSize: true,
          multiplier
        });
      }
    }
  }
  return stepUnitSizeCombinations;
};

const generateNewPricelistCombinations = (
  newBasicPriceRows,
  newStepMultiplierRows,
  newIndustryMultiplierRows,
  oldPricelistTable,
  serviceId
) => {
  for (let { step, unit, size, multiplier: stepMultiplierValue } of newStepMultiplierRows) {
    for (let { sourceLanguage, targetLanguage, basicPrice } of newBasicPriceRows) {
      for (let { industry, multiplier: industryMultiplierValue } of newIndustryMultiplierRows) {
        oldPricelistTable.push({
          serviceId,
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
  return oldPricelistTable;
};

const getPricelistCombinations = async (
  basicPricesTable,
  stepMultipliersTable,
  industryMultipliersTable,
  oldPricelistTable,
  fromDelete = false
) => {
  const newPricelistCombinations = [];
  for (let { step, unit, size, multiplier: stepMultiplierValue } of stepMultipliersTable) {
    for (let { sourceLanguage, targetLanguage, basicPrice } of basicPricesTable) {
      for (let { industry, multiplier: industryMultiplierValue } of industryMultipliersTable) {
        newPricelistCombinations.push({
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
  const newPricelistComboIds = newPricelistCombinations.map(item => (
    `${item.sourceLanguage} ${item.targetLanguage} ${item.step} ${item.unit} ${item.unit} ${item.size} ${item.industry}`
  ));
  newPricelistCombinations.push(...oldPricelistTable);
  const unique = oldPricelistTable.filter(item => (
    newPricelistComboIds.includes(
      `${item.sourceLanguage} ${item.targetLanguage} ${item.step} ${item.unit} ${item.unit} ${item.size} ${item.industry}`
    )
  ));
  return fromDelete ? unique : _.uniqBy(newPricelistCombinations, (item) => (
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
  const { stepMultipliersTable: filteredStepsTable } = await filterRedundantSteps(
    client.rates,
    client.services,
    serviceToDelete._id,
    services
  );
  const { industryMultipliersTable: filteredIndustriesTable } = await filterRedundantIndustries(
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
  await Clients.updateOne({ _id: clientId }, {
    rates: {
      basicPricesTable,
      stepMultipliersTable: filteredStepsTable,
      industryMultipliersTable: filteredIndustriesTable,
      pricelistTable
    }
  });
};


module.exports = {
  updateClientRates,
  addNewRateComponents,
  getServiceDifferences,
  deleteClientRates,
  getStepMultipliersCombinations,
  getNeededCurrency,
  getNeededLangPair,
  getNeededStepRow,
  getPricelistCombinations,
  getObjDifferences,
  replaceOldItem,
  changePricelistTable
};
