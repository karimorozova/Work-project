const ObjectId = require('mongodb').ObjectID;
const { Step, Clients, Services } = require('../models');
const { differenceOperationType } = require('../enums/differenceOperationType');
const { multiplyPrices } = require('../multipliers');
const { tableKeys } = require('../enums');

const updateClientLangPairs = async (sourceLangId, sourceLangDifference, targetLangDifference, clientId, serviceId) => {
  const { rates, services } = await Clients.findOne({ _id: clientId });
  let updatedRates = rates;
  if (targetLangDifference) {
    const { difference, itemsToAdd, itemsToDelete } = targetLangDifference;
    switch (difference) {
      default:
      case differenceOperationType.DeleteAndReplace || differenceOperationType.JustReplace ||
      differenceOperationType.AddAndReplace:
        updatedRates = await filterRedundantLangPairs(updatedRates, services, serviceId, itemsToDelete, sourceLangId);
        updatedRates = await pushNewTargetPairs(updatedRates, services, serviceId, itemsToAdd, sourceLangId);
        break;
      case differenceOperationType.JustAdd:
        updatedRates = await pushNewTargetPairs(updatedRates, services, serviceId, itemsToAdd, sourceLangId);
        break;
      case differenceOperationType.JustDelete:
        updatedRates = await filterRedundantLangPairs(updatedRates, services, serviceId, itemsToDelete, sourceLangId);
        break;
    }
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
      updatedRates = await filterRedundantSteps(client.rates, client.services, serviceId, itemsToDelete);
      updatedRates = await pushNewStepCombinations(updatedRates, client.services, serviceId, itemsToAdd);
      await Clients.updateOne({ _id: client._id }, { rates: updatedRates });
      break;
    case differenceOperationType.JustAdd:
      updatedRates = await pushNewStepCombinations(client.rates, client.services, serviceId, itemsToAdd);
      await Clients.updateOne({ _id: client._id }, { rates: updatedRates });
      break;
    case differenceOperationType.JustDelete:
      updatedRates = await filterRedundantSteps(client.rates, client.services, serviceId, itemsToDelete);
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
      updatedRates = await filterRedundantIndustries(client.rates, client.services, serviceId, itemsToDelete);
      updatedRates = await pushNewIndustryMultiplier(updatedRates, client.services, serviceId, itemsToAdd);
      await Clients.updateOne({ _id: client._id }, { rates: updatedRates });
      break;
    case differenceOperationType.JustAdd:
      updatedRates = await pushNewIndustryMultiplier(client.rates, client.services, serviceId, itemsToAdd);
      await Clients.updateOne({ _id: client._id }, { rates: updatedRates });
      break;
    case differenceOperationType.JustDelete:
      updatedRates = await filterRedundantIndustries(client.rates, client.services, serviceId, itemsToDelete);
      await Clients.updateOne({ _id: client._id }, { rates: updatedRates });
      break;
  }
};

const pushNewTargetPairs = async (rates, services, currentServiceId, itemsToAdd, sourceLanguage) => {
  const { stepMultipliersTable, industryMultipliersTable } = rates;
  const changedService = services.find(item => item._id.toString() === currentServiceId.toString());
  const neededStepRows = await findServiceRows(stepMultipliersTable, changedService, tableKeys.stepMultipliersTable);
  const neededIndustryRows = await findServiceRows(industryMultipliersTable, changedService, tableKeys.industryMultipliersTable);
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
        neededStepRows,
        neededIndustryRows,
      ));
  }
  return rates;
};

const filterRedundantLangPairs = async (rates, services, currentServiceId, itemsToDelete, sourceLangId) => {
  const { stepMultipliersTable, industryMultipliersTable } = rates;
  const itemsToDeleteIds = itemsToDelete.map(item => `${sourceLangId} ${item._id}`);
  const changedService = services.find(item => item._id.toString() === currentServiceId.toString());
  const neededStepRows = await findServiceRows(stepMultipliersTable, changedService, tableKeys.stepMultipliersTable);
  const neededIndustryRows = await findServiceRows(industryMultipliersTable, changedService, tableKeys.industryMultipliersTable);
  const duplicatesArr = checkForDuplicateLangPairs(services, currentServiceId, itemsToDeleteIds);
  if (!duplicatesArr.length) {
    return {
      ...rates,
      basicPricesTable: rates.basicPricesTable.filter(({ sourceLanguage, targetLanguage }) => (
        !itemsToDeleteIds.includes(`${sourceLanguage} ${targetLanguage}`)
      )),
      pricelistTable: rates.pricelistTable.filter(item => (
        !itemsToDeleteIds.includes(`${item.sourceLanguage} ${item.targetLanguage}`)
      ))
    };
  } else {
    return {
      ...rates,
      pricelistTable: await filterPricelistTable(
        rates.pricelistTable,
        [],
        neededIndustryRows,
        neededStepRows,
        itemsToDeleteIds,
        tableKeys.basicPricesTable
      )
    };
  }

};

const pushNewStepCombinations = async (rates, services, currentServiceId, itemsToAdd) => {
  const { basicPricesTable, stepMultipliersTable, industryMultipliersTable, pricelistTable } = rates;
  const changedService = services.find(item => item._id.toString() === currentServiceId.toString());
  const neededBasicPriceRows = await findServiceRows(basicPricesTable, changedService, tableKeys.basicPricesTable);
  const neededIndustryRows = await findServiceRows(industryMultipliersTable, changedService, tableKeys.industryMultipliersTable);
  for (let { steps } of itemsToAdd) {
    for (let { step: _id } of steps) {
      const neededStep = await Step.findOne({ _id });
      const { calculationUnit } = neededStep;
      if (!calculationUnit.length) {
        return [];
      } else {
        for (let item of calculationUnit) {
          const { _id: unitId } = item;
          const sizes = item.hasOwnProperty('sizes') ? item.sizes : [];
          const duplicatesArr = checkForDuplicates(services, currentServiceId, itemsToAdd, 'services');
          if (!duplicatesArr.length) {
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
            pricelistTable.push(...generateNewStepCombinations(neededBasicPriceRows, neededIndustryRows, _id, unitId, sizes));
          } else {
            pricelistTable.push(...generateNewStepCombinations(neededBasicPriceRows, neededIndustryRows, _id, unitId, sizes));
          }
        }
      }
    }
  }
  return rates;
};

const filterRedundantSteps = async (rates, services, currentServiceId, itemsToDelete) => {
  const { basicPricesTable, industryMultipliersTable } = rates;
  const itemsToDeleteIds = itemsToDelete.map(({ steps }) => steps.map(({ step }) => step.toString()))
    .reduce((acc, curr) => [...acc, ...curr], []);
  const changedService = services.find(item => item._id.toString() === currentServiceId.toString());
  const neededBasicPriceRows = await findServiceRows(basicPricesTable, changedService, tableKeys.basicPricesTable);
  const neededIndustryRows = await findServiceRows(industryMultipliersTable, changedService, tableKeys.industryMultipliersTable);
  const duplicatesArr = checkForDuplicates(services, currentServiceId, itemsToDelete, 'services');
  if (!duplicatesArr.length) {
    return {
      ...rates,
      stepMultipliersTable: rates.stepMultipliersTable.filter(item => !itemsToDeleteIds.includes(item.step.toString())),
      pricelistTable: rates.pricelistTable.filter(item => !itemsToDeleteIds.includes(item.step.toString()))
    };
  } else {
    return {
      ...rates,
      pricelistTable: await filterPricelistTable(
        rates.pricelistTable,
        neededBasicPriceRows,
        neededIndustryRows,
        [],
        itemsToDeleteIds,
        tableKeys.stepMultipliersTable
      )
    };
  }
};

const pushNewIndustryMultiplier = async (rates, services, currentServiceId, itemsToAdd) => {
  const { basicPricesTable, stepMultipliersTable, industryMultipliersTable, pricelistTable } = rates;
  const changedService = services.find(item => item._id.toString() === currentServiceId.toString());
  const neededBasicPriceRows = await findServiceRows(basicPricesTable, changedService, tableKeys.basicPricesTable);
  const neededStepMultiplierRows = await findServiceRows(stepMultipliersTable, changedService, tableKeys.stepMultipliersTable);
  const duplicatesArr = checkForDuplicates(services, currentServiceId, itemsToAdd, 'industries');

  for (let { _id } of itemsToAdd) {
    if (!duplicatesArr.length) {
      industryMultipliersTable.push({
        industry: _id
      });
      pricelistTable.push(...generateNewIndustryCombinations(neededBasicPriceRows, neededStepMultiplierRows, _id));
    } else {
      pricelistTable.push(...generateNewIndustryCombinations(neededBasicPriceRows, neededStepMultiplierRows, _id));
    }
  }
  return rates;
};

const filterRedundantIndustries = async (rates, services, currentServiceId, itemsToDelete) => {
  const { basicPricesTable, stepMultipliersTable, pricelistTable } = rates;
  const duplicatesArr = checkForDuplicates(services, currentServiceId, itemsToDelete, 'industries');
  const changedService = services.find(item => item._id.toString() === currentServiceId.toString());
  const neededBasicPriceRows = await findServiceRows(basicPricesTable, changedService, tableKeys.basicPricesTable);
  const neededStepMultiplierRows = await findServiceRows(stepMultipliersTable, changedService, tableKeys.stepMultipliersTable);
  const itemsToDeleteIds = itemsToDelete.map(item => item._id.toString());
  if (!duplicatesArr.length) {
    return {
      ...rates,
      industryMultipliersTable: rates.industryMultipliersTable.filter(item => !itemsToDeleteIds.includes(item.industry.toString())),
      pricelistTable: rates.pricelistTable.filter(item => !itemsToDeleteIds.includes(item.industry.toString()))
    };
  } else {
    return {
      ...rates,
      pricelistTable: await filterPricelistTable(
        pricelistTable,
        neededBasicPriceRows,
        [],
        neededStepMultiplierRows,
        itemsToDeleteIds,
        tableKeys.industryMultipliersTable
      )
    };
  }
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

const checkForDuplicateLangPairs = (clientServices, currentServiceId, langPairIds) => {
  const occurrences = [];
  const servicesForCheck = clientServices.filter(({ _id }) => _id.toString() !== currentServiceId.toString());
  for (let langPairString of langPairIds) {
    const sourceLanguage = langPairString.split(' ')[0];
    const targetLanguage = langPairString.split(' ')[1];
    for (let service of servicesForCheck) {
      const sameItem = service.targetLanguages.find(item => (
        `${service.sourceLanguage} ${item}` === `${sourceLanguage} ${targetLanguage}`
      ));
      if (sameItem) occurrences.push(sameItem);
    }
  }
  return occurrences;
};

const generateNewLangCombinations = (
  targetLanguage,
  sourceLanguage,
  stepMultiplierRows,
  industryMultiplierRows,
) => {
  const newCombinations = [];
  for (let { step, unit, multiplier: stepMultiplierValue } of stepMultiplierRows) {
    for (let { industry, multiplier: industryMultiplierValue } of industryMultiplierRows) {
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

const generateNewStepCombinations = (langPairRows, industryMultiplierRows, { _id }, unitId, sizes) => {
  const newCombinations = [];
  for (let { sourceLanguage, targetLanguage, basicPrice } of langPairRows) {
    for (let { industry, multiplier: industryMultiplierValue } of industryMultiplierRows) {
      if (sizes.length) {
        for (let size of sizes) {
          newCombinations.push({
            sourceLanguage,
            targetLanguage,
            step: _id,
            unit: unitId,
            size,
            industry,
            price: multiplyPrices(basicPrice, 100, industryMultiplierValue)
          });
        }
      } else {
        newCombinations.push({
          sourceLanguage,
          targetLanguage,
          step: _id,
          unit: unitId,
          size: 1,
          industry,
          price: multiplyPrices(basicPrice, 100, industryMultiplierValue)
        });
      }
    }
  }
  return newCombinations;
};

const generateNewIndustryCombinations = (langPairRows, stepMultiplierRows, newIndustryId) => {
  const newCombinations = [];
  for (let { sourceLanguage, targetLanguage, basicPrice } of langPairRows) {
    for (let { step, unit, size, multiplier: stepMultiplierValue } of stepMultiplierRows) {
      newCombinations.push({
        sourceLanguage,
        targetLanguage,
        step,
        unit,
        size,
        industry: newIndustryId,
        price: multiplyPrices(basicPrice, stepMultiplierValue, 100),
      });
    }
  }
  return newCombinations;
};

const findServiceRows = async (arr, service, key) => {
  const neededRows = [];
  switch (key) {
    default:
    case tableKeys.basicPricesTable:
      const { sourceLanguage, targetLanguages } = service;
      for (let targetLanguage of targetLanguages) {
        neededRows.push(arr.find(item =>
          (`${item.sourceLanguage} ${item.targetLanguage}` === `${sourceLanguage} ${targetLanguage}`
          )));
      }
      break;
    case tableKeys.stepMultipliersTable:
      const { services } = service;
      for (let serviceId of services) {
        const { steps } = await Services.findOne({ _id: serviceId });
        for (let { step } of steps) {
          const { calculationUnit } = await Step.findOne({ _id: step });
          if (calculationUnit.length) {
            for (let item of calculationUnit) {
              const { _id: unitId } = item;
              const sizes = item.hasOwnProperty('sizes') ? item.sizes : [];
              if (sizes.length) {
                for (let size of sizes) {
                  neededRows.push(arr.find(item => (
                    `${item.step} ${item.unit} ${item.size}` === `${step} ${unitId} ${size}`
                  )));
                }
              } else {
                neededRows.push(arr.find(item => (
                  `${item.step} ${item.unit} ${item.size}` === `${step} ${unitId} ${1}`
                )));
              }
            }
          }
        }
      }
      break;
    case tableKeys.industryMultipliersTable:
      const { industries } = service;
      for (let industry of industries) {
        neededRows.push(arr.find(item => item.industry.toString() === industry.toString()));
      }
  }
  return neededRows;
};

const filterPricelistTable = (
  pricelistTable,
  langPairRows = [],
  industryMultiplierRows = [],
  stepMultiplierRows = [],
  idsToDelete,
  key) => {
  let filteredPricelist = [];
  switch (key) {
    default:
    case tableKeys.basicPricesTable:
      for (let idPair of idsToDelete) {
        const sourceLanguage = idPair.split(' ')[0];
        const targetLanguage = idPair.split(' ')[1];
        for (let { step } of stepMultiplierRows) {
          for (let { industry } of industryMultiplierRows) {
            filteredPricelist = pricelistTable.filter(item => (
              `${item.sourceLanguage} ${item.targetLanguage} ${item.step} ${item.industry}` !==
              `${sourceLanguage} ${targetLanguage} ${step} ${industry}`
            ));
          }
        }
      }
      break;
    case tableKeys.stepMultipliersTable:
      for (let { sourceLanguage, targetLanguage } of langPairRows) {
        for (let id of idsToDelete) {
          for (let { industry } of industryMultiplierRows) {
            filteredPricelist = pricelistTable.filter(item => (
              `${item.sourceLanguage} ${item.targetLanguage} ${item.step} ${item.industry}` !==
              `${sourceLanguage} ${targetLanguage} ${id} ${industry}`
            ));
          }
        }
      }
      break;
    case tableKeys.industryMultipliersTable:
      for (let { sourceLanguage, targetLanguage } of langPairRows) {
        for (let { step } of stepMultiplierRows) {
          for (let id of idsToDelete) {
            filteredPricelist = pricelistTable.filter(item => (
              `${item.sourceLanguage} ${item.targetLanguage} ${item.step} ${item.industry}` !==
              `${sourceLanguage} ${targetLanguage} ${step} ${id}`
            ));
          }
        }
      }
  }
  return filteredPricelist;
};

module.exports = {
  updateClientLangPairs,
  updateClientStepMultipliers,
  updateClientIndustryMultipliers,
  filterRedundantLangPairs,
  filterRedundantSteps,
  filterRedundantIndustries,
  generateNewStepCombinations
};
