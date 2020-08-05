const ObjectId = require('mongodb').ObjectID;
const { Step, Clients, Services } = require('../models');
const { differenceOperationType } = require('../enums/differenceOperationType');
const { multiplyPrices } = require('../multipliers');

const updateClientLangPairs = async (sourceLangId, sourceLangDifference, targetLangDifference, clientId) => {
  const { rates } = await Clients.findOne({ _id: clientId });
  const { difference, itemsToAdd, itemsToDelete } = targetLangDifference;
  let updatedRates = rates;
  switch (difference) {
    default:
    case differenceOperationType.DeleteAndReplace || differenceOperationType.JustReplace ||
    differenceOperationType.AddAndReplace:
      updatedRates = filterRedundantLangPairs(updatedRates, itemsToDelete, sourceLangId);
      updatedRates = pushNewTargetPairs(updatedRates, itemsToAdd, sourceLangId);
      break;
    case differenceOperationType.JustAdd:
      updatedRates = pushNewTargetPairs(updatedRates, itemsToAdd, sourceLangId);
      break;
    case differenceOperationType.JustDelete:
      updatedRates = filterRedundantLangPairs(updatedRates, itemsToDelete, sourceLangId);
      break;
  }
  if (sourceLangDifference.lang) {
    const { basicPricesTable, pricelistTable } = updatedRates;
    basicPricesTable.map(item => {
      if (item.sourceLanguage.toString() === sourceLangId.toString()) {
        item.sourceLanguage = sourceLangDifference._id;
      }
      return item;
    });
    pricelistTable.map(item => {
      if (item.sourceLanguage.toString() === sourceLangId.toString()) {
        item.sourceLanguage = sourceLangDifference._id;
      }
      return item;
    });
  }
  await Clients.updateOne({ _id: clientId }, { rates: updatedRates });
};

const updateClientStepMultipliers = async (serviceStepDifference, clientId, serviceId) => {
  const { difference, itemsToAdd, itemsToDelete } = serviceStepDifference;
  const client = await Clients.findOne({ _id: clientId });
  let updatedRates;
  switch (difference) {
    default:
    case differenceOperationType.DeleteAndReplace || differenceOperationType.JustReplace ||
    differenceOperationType.AddAndReplace:
      updatedRates = filterRedundantSteps(client.rates, client.services, serviceId, itemsToDelete);
      updatedRates = await pushNewStepCombinations(updatedRates, client.services, serviceId, itemsToAdd);
      await Clients.updateOne({ _id: client._id }, { rates: updatedRates });
      break;
    case differenceOperationType.JustAdd:
      updatedRates = await pushNewStepCombinations(client.rates, client.services, serviceId, itemsToAdd);
      await Clients.updateOne({ _id: client._id }, { rates: updatedRates });
      break;
    case differenceOperationType.JustDelete:
      updatedRates = filterRedundantSteps(client.rates, client.services, serviceId, itemsToDelete);
      await Clients.updateOne({ _id: client._id }, { rates: updatedRates });
      break;
  }
};
const updateClientIndustryMultipliers = async (industryDifference, clientId, serviceId) => {
  const { difference, itemsToAdd, itemsToDelete } = industryDifference;
  const client = await Clients.findOne({ _id: clientId });
  let updatedRates;
  switch (difference) {
    default:
    case differenceOperationType.DeleteAndReplace || differenceOperationType.JustReplace ||
    differenceOperationType.AddAndReplace:
      updatedRates = filterRedundantIndustries(client.rates, client.services, serviceId, itemsToDelete);
      updatedRates = pushNewIndustryMultiplier(updatedRates, client.services, serviceId, itemsToAdd);
      await Clients.updateOne({ _id: client._id }, { rates: updatedRates });
      break;
    case differenceOperationType.JustAdd:
      updatedRates = pushNewIndustryMultiplier(client.rates, client.services, serviceId, itemsToAdd);
      await Clients.updateOne({ _id: client._id }, { rates: updatedRates });
      break;
    case differenceOperationType.JustDelete:
      updatedRates = filterRedundantIndustries(client.rates, client.services, serviceId, itemsToDelete);
      await Clients.updateOne({ _id: client._id }, { rates: updatedRates });
      break;
  }
};

const pushNewTargetPairs = (rates, itemsToAdd, sourceLanguage) => {
  const { stepMultipliersTable, industryMultipliersTable } = rates;
  for (let { _id } of itemsToAdd) {
    rates.basicPricesTable.push({
      type: _id.toString() === sourceLanguage.toString() ? 'Mono' : 'Duo',
      sourceLanguage: ObjectId(sourceLanguage),
      targetLanguage: ObjectId(_id),
    });
    rates.pricelistTable.push(
      ...generateNewLangCombinations(
        _id,
        sourceLanguage,
        stepMultipliersTable,
        industryMultipliersTable,
      ));
  }
  return rates;
};

const filterRedundantLangPairs = (rates, itemsToDelete, sourceLangId) => {
  const itemsToDeleteIdPairs = itemsToDelete.map(item => `${sourceLangId} ${item._id}`);
  return {
    ...rates,
    basicPricesTable: rates.basicPricesTable.filter(({ sourceLanguage, targetLanguage }) => (
      !itemsToDeleteIdPairs.includes(`${sourceLanguage} ${targetLanguage}`)
    )),
    pricelistTable: rates.pricelistTable.filter(({ sourceLanguage, targetLanguage }) => (
      !itemsToDeleteIdPairs.includes(`${sourceLanguage} ${targetLanguage}`)
    ))
  };
};

const pushNewStepCombinations = async (rates, services, currentServiceId, itemsToAdd) => {
  const { basicPricesTable, stepMultipliersTable, industryMultipliersTable, pricelistTable } = rates;
  const duplicatesArr = checkForDuplicates(services, currentServiceId, itemsToAdd, 'services');
  if (duplicatesArr.length) return rates;
  for (let { steps } of itemsToAdd) {
    for (let { step: _id } of steps) {
      const neededStep = await Step.findOne({ _id });
      const { calculationUnit } = neededStep;
      if (!calculationUnit.length) {
        return [];
      } else {
        for (let { _id: unitId, sizes } of calculationUnit) {
          if (sizes.length) {
            sizes.forEach(size => {
              stepMultipliersTable.push({
                step: _id,
                unit: unitId,
                size
              });
            });
          } else {
            stepMultipliersTable.push({
              step: _id,
              unit: unitId,
              size: 1
            });
          }
          pricelistTable.push(...generateNewStepCombinations(basicPricesTable, industryMultipliersTable, _id, unitId));
        }
      }
    }
  }
  return rates;
};

const filterRedundantSteps = (rates, services, currentServiceId, itemsToDelete) => {
  const itemsToDeleteIds = itemsToDelete.map(({ steps }) => steps.map(({ step }) => step.toString()))
    .reduce((acc, curr) => [...acc, ...curr], []);
  const duplicatesArr = checkForDuplicates(services, currentServiceId, itemsToDelete, 'services');
  if (duplicatesArr.length) return rates;
  return {
    ...rates,
    stepMultipliersTable: rates.stepMultipliersTable.filter(item => !itemsToDeleteIds.includes(item.step.toString())),
    pricelistTable: rates.pricelistTable.filter(item => !itemsToDeleteIds.includes(item.step.toString()))
  };
};

const pushNewIndustryMultiplier = (rates, services, currentServiceId, itemsToAdd) => {
  const { basicPricesTable, stepMultipliersTable, industryMultipliersTable, pricelistTable } = rates;
  const duplicatesArr = checkForDuplicates(services, currentServiceId, itemsToAdd, 'industries');
  if (duplicatesArr.length) return rates;
  for (let { _id } of itemsToAdd) {
    industryMultipliersTable.push({
      industry: _id
    });
    pricelistTable.push(...generateNewIndustryCombinations(basicPricesTable, stepMultipliersTable, _id, currentServiceId));
  }
  return rates;
};

const filterRedundantIndustries = (rates, services, currentServiceId, itemsToDelete) => {
  const duplicatesArr = checkForDuplicates(services, currentServiceId, itemsToDelete, 'industries');
  if (duplicatesArr.length) return rates;
  const itemsToDeleteIds = itemsToDelete.map(item => item._id.toString());
  return {
    ...rates,
    industryMultipliersTable: rates.industryMultipliersTable.filter(item => !itemsToDeleteIds.includes(item.industry.toString())),
    pricelistTable: rates.pricelistTable.filter(item => !itemsToDeleteIds.includes(item.industry.toString()))
  };
};

const checkForDuplicates = (clientServices, currentServiceId, operationItems, key) => {
  const occurrences = [];
  const servicesForCheck = clientServices.filter(({ _id }) => _id.toString() !== currentServiceId.toString());
  for (let { _id } of operationItems) {
    for (let item of servicesForCheck) {
      const sameItem = item[key].find(item => item.toString() === _id.toString());
      if (sameItem) occurrences.push(sameItem);
    }
  }
  return occurrences;
};

const generateNewLangCombinations = (
  targetLanguage,
  sourceLanguage,
  stepMultipliersTable,
  industryMultipliersTable,
) => {
  const newCombinations = [];
  for (let { step, unit, multiplier: stepMultiplierValue } of stepMultipliersTable) {
    for (let { industry, multiplier: industryMultiplierValue } of industryMultipliersTable) {
      newCombinations.push({
        sourceLanguage,
        targetLanguage,
        step,
        unit,
        industry,
        price: multiplyPrices(1, stepMultiplierValue, industryMultiplierValue)
      });
    }
  }
  return newCombinations;
};

const generateNewStepCombinations = (basicPriceTable, industryMultipliersTable, newStepId, unitId) => {
  const newCombinations = [];
  for (let { sourceLanguage, targetLanguage, basicPrice } of basicPriceTable) {
    for (let { industry, multiplier: industryMultiplierValue } of industryMultipliersTable) {
      newCombinations.push({
        sourceLanguage,
        targetLanguage,
        step: newStepId,
        unit: unitId,
        industry,
        price: multiplyPrices(basicPrice, 100, industryMultiplierValue)
      });
    }
  }
  return newCombinations;
};

const generateNewIndustryCombinations = (basicPriceTable, stepMultipliersTable, newIndustryId) => {
  const newCombinations = [];
  for (let { sourceLanguage, targetLanguage, basicPrice } of basicPriceTable) {
    for (let { step, unit, multiplier: stepMultiplierValue } of stepMultipliersTable) {
      newCombinations.push({
        sourceLanguage,
        targetLanguage,
        step,
        unit,
        industry: newIndustryId,
        price: multiplyPrices(basicPrice, stepMultiplierValue, 100),
      });
    }
  }
  return newCombinations;
};

module.exports = {
  updateClientLangPairs,
  updateClientStepMultipliers,
  updateClientIndustryMultipliers,
  filterRedundantSteps,
  filterRedundantIndustries
};
