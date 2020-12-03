const { Clients, Step, Services, Pricelist, Languages, Industries } = require('../models');
const ObjectId = require('mongodb').ObjectID;
const _ = require('lodash');
const { multiplyPrices } = require('../multipliers/pricelist');
const {
  updateClientLangPairs,
  updateClientStepMultipliers,
  updateClientIndustryMultipliers,
} = require('./editClientRates');
const { tableKeys } = require('../enums');
const { getRateInfoFromStepFinance } = require('../pricelist/ratesmanage');
const { getClient } = require('../clients');

/**
 *
 * @param {ObjectId} clientId
 * @param {String} itemIdentifier
 * @param {Object} updatedItem
 * @returns nothing - just updates DB
 */
const updateClientRates = async (clientId, itemIdentifier, updatedItem) => {
  const client = await Clients.findOne({ _id: clientId });
  const boundPricelist = await Pricelist.findOne({ _id: client.defaultPricelist });
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
      break;
  }
  await Clients.updateOne({ _id: clientId }, { rates: client.rates });
};

/**
 *
 * @param {Array} arr - operation array
 * @param {Object} replacementItem - replacement item
 * @param {Object} boundPricelist - pricelist that has been bound to client
 * @param {String} key - key for selecting needed table
 * @param {String} personKey - client's name
 * @returns {Array} returns updated array of objects
 */
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
      altered = neededIndustryRow ? neededIndustryRow.altered : false;
  }
  replacementItem.notification = `${personKey}'s data is different from pricelist`;
  const itemToUpdateIndex = findIndexToReplace(arr, _id);
  arr.splice(itemToUpdateIndex, 1, replacementItem);
  return arr;
};

/**
 *
 * @param {Array} arr - operation array
 * @param {String} searchItemId - id of a needed item
 * @returns {Number} returns index of needed item
 */
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
          item.price = item.price.toFixed(4);
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
          item.price = item.price.toFixed(4);
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
          item.price = item.price.toFixed(4);
        }
        return item;
      });
  }
  return updatedPricelist;
};
/**
 * @param {ObjectId} clientId - id of a current client
 * @param newServicesArr - fresh created services, consists: {
 *   sourceLanguage: {Object},
 *   targetLanguages: {Array},
 *   services: {Array},
 *   industries: {Array}
 * }
 * @returns: Nothing, but updates client's rates with new combinations
 */
const addNewRateComponents = async (clientId, newServicesArr) => {
  const { rates, currency, defaultPricelist } = await Clients.findOne({ _id: clientId });
  const boundPricelist = await Pricelist.findOne({ _id: defaultPricelist });
  let { basicPricesTable, stepMultipliersTable, industryMultipliersTable, pricelistTable } = rates;
  const freshBasicPriceRows = [];
  const newStepMultiplierCombinations = [];
  const newIndustryMultiplierCombinations = [];
  for (let newService of newServicesArr) {
    newService = await gatherFullServiceInfo(newService);
    const { sourceLanguage, targetLanguages } = newService;
    const { uniqueServiceSteps, uniqueIndustries } = await getUniqueServiceItems(newService, rates);
    const newSteps = [];
    for (let { steps } of newService.services) {
      for (let { step } of steps) {
        newSteps.push({ _id: step._id });
      }
    }
    const newIndustries = newService.industries.map(item => item._id);
    for (let step of newSteps) {
      newStepMultiplierCombinations.push(...await getStepMultipliersCombinations(step, boundPricelist));
    }
    for (let industry of newIndustries) {
      const neededIndustryRow = boundPricelist.industryMultipliersTable.find(item => (
        item.industry.toString() === industry.toString()
      ));
      const multiplier = neededIndustryRow ? neededIndustryRow.multiplier : 100;
      newIndustryMultiplierCombinations.push({
        industry,
        multiplier
      });
    }
    for (let { _id } of targetLanguages) {
      const neededLangPair = getNeededLangPair(boundPricelist.basicPricesTable, sourceLanguage._id, _id);
      const boundBasicPrice = neededLangPair ? getNeededCurrency(neededLangPair, currency) : 1;
      const newBasicPriceObj = {
        type: sourceLanguage._id.toString() === _id.toString() ? 'Mono' : 'Duo',
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
  }
  pricelistTable.push(...generateNewPricelistCombinations(
    freshBasicPriceRows,
    newStepMultiplierCombinations,
    newIndustryMultiplierCombinations,
    pricelistTable));
  basicPricesTable = _.uniqBy(basicPricesTable, item => (
    item.sourceLanguage.toString() +
    item.targetLanguage.toString()
  ));
  pricelistTable = _.uniqBy(pricelistTable, item => (
    item.sourceLanguage.toString() +
    item.targetLanguage.toString() +
    item.step.toString() +
    item.unit.toString() +
    item.size +
    item.industry.toString()
  ));
  await Clients.updateOne({ _id: clientId },
    { rates: { basicPricesTable, stepMultipliersTable, industryMultipliersTable, pricelistTable } }
  );
};

/**
 *
 * @param {ObjectId} sourceLanguageId
 * @param {ObjectId} targetLanguageId
 * @param {ObjectId} serviceId
 * @param {ObjectId} industryId
 * @returns {Object} returns fullfilled object with all needed information
 */
const gatherFullServiceInfo = async (
  {
    sourceLanguage: sourceLanguageId,
    targetLanguages: targetLanguageId,
    services: serviceId,
    industries: industryId
  }) => {
  return {
    sourceLanguage: await Languages.findOne({ _id: sourceLanguageId }),
    targetLanguages: [await Languages.findOne({ _id: targetLanguageId })],
    services: [await Services.findOne({ _id: serviceId })],
    industries: [await Industries.findOne({ _id: industryId })]
  };
};

/**
 *
 * @param {Object} basicPriceObj
 * @param {String} clientCurrency
 * @returns {Object} returns needed price according to client's currency
 */
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

/**
 *
 * @param {Array} arr - operation array
 * @param {ObjectId} sourceLangId
 * @param {ObjectId} targetLangId
 * @returns {Object} returns object with needed language pair
 */
const getNeededLangPair = (arr, sourceLangId, targetLangId) => (
  arr.find(item => (
    item.sourceLanguage.toString() === sourceLangId.toString() &&
    item.targetLanguage.toString() === targetLangId.toString()
  )));

/**
 *
 * @param {Array} arr - operation array
 * @param {Object} step - step object
 * @param {Object} unit - unit object
 * @param {Number} size - size to find same
 * @returns {Object} - returns object of a needed step row
 */
const getNeededStepRow = (arr, step, unit, size) => (
  arr.find(item => (
    `${item.step} ${item.unit} ${item.size}` === `${step._id} ${unit._id} ${size}`
  ))
);

/**
 *
 * @param {Object} newService - object of a new service
 * @param {Object} rates - rates object
 * @returns {Object} - returns unique service steps and industries
 */
const getUniqueServiceItems = async (newService, rates) => {
  const { services: newServices, industries: newIndustries } = newService;
  const { stepMultipliersTable, industryMultipliersTable } = rates;
  const newStepUnitCombination = await getStepUnitCombinations(newServices);
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

/**
 *
 * @param {Array} newServices - array of a new services
 * @returns {Array} - returns unique step-unit rows
 */
const getStepUnitCombinations = async (newServices) => {
  const stepUnitCombinations = [];
  for (let { steps } of newServices) {
    for (let { step } of steps) {
      step = await Step.findOne({ _id: step });
      const { _id, calculationUnit } = step;
      for (let { _id: unitId } of calculationUnit) {
        stepUnitCombinations.push(`${_id} - ${unitId}`);
      }
    }
  }
  return Array.from(new Set(stepUnitCombinations));
};

//TODO: Add clients currencies for combinations
/**
 *
 * @param {ObjectId} _id - step's id
 * @param {Array} stepMultipliersTable
 * @returns {Array} - returns array of step combinations
 */
const getStepMultipliersCombinations = async ({ _id }, { stepMultipliersTable }) => {
  const stepUnitSizeCombinations = [];
  const { calculationUnit } = await Step.findOne({ _id });
  if (!calculationUnit.length) {
    return [];
  } else {
    for (let item of calculationUnit) {
      const { _id: unitId } = item;
      const sizes = item.hasOwnProperty('sizes') ? item.sizes : [];
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

/**
 *
 * @param {Array} newBasicPriceRows - new basic price rows
 * @param {Array} newStepMultiplierRows - new step multiplier rows
 * @param {Array} newIndustryMultiplierRows - new industry multiplier rows
 * @param {Array} oldPricelistTable - old pricelist table
 * @returns {Array} - returns fullfilled pricelist table
 */
const generateNewPricelistCombinations = (
  newBasicPriceRows,
  newStepMultiplierRows,
  newIndustryMultiplierRows,
  oldPricelistTable,
) => {
  for (let { step, unit, size, multiplier: stepMultiplierValue } of newStepMultiplierRows) {
    for (let { sourceLanguage, targetLanguage, basicPrice } of newBasicPriceRows) {
      for (let { industry, multiplier: industryMultiplierValue } of newIndustryMultiplierRows) {
        oldPricelistTable.push({
          sourceLanguage,
          targetLanguage,
          step,
          unit,
          size,
          industry,
          price: multiplyPrices(basicPrice, stepMultiplierValue, size, industryMultiplierValue),
        });
      }
    }
  }
  return oldPricelistTable;
};

/**
 *
 * @param {Array} basicPricesTable - basic prices rows
 * @param {Array} stepMultipliersTable - step multiplier rows
 * @param {Array} industryMultipliersTable - industry multiplier rows
 * @param {Array} oldPricelistTable - old pricelist table
 * @param {Boolean} fromDelete - key that variates from true to false
 * @returns {Array} returns unique pricelist combinations
 */
const getPricelistCombinations = (
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
          price: multiplyPrices(basicPrice, stepMultiplierValue, size, industryMultiplierValue),
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

Object.fromEntries = l => l.reduce((a, [k, v]) => ({ ...a, [k]: v }), {});

/**
 *
 * @param {Object} client
 * @param {Object} updatedService - new service entity
 * @param {Object} oldService - old service entity
 * @param {Object} dataToUpdate
 * @returns nothing - just updates a client
 */
const updateClientRatesFromServices = async (client, updatedService, oldService, dataToUpdate) => {
  const { _id, rates, services } = client;
  const sourceLangDifference = getSourceLangDifference(updatedService.sourceLanguage, oldService.sourceLanguage._id);
  const targetLangDifference = getArrDifference(updatedService.targetLanguages, oldService.targetLanguages);
  const serviceStepDifference = getArrDifference(updatedService.services, oldService.services);
  const industryDifference = getArrDifference(updatedService.industries, oldService.industries);
  let updatedBasicPricesTable = rates.basicPricesTable;
  let updatedStepMultipliersTable = rates.stepMultipliersTable;
  let updatedIndustryMultipliersTable = rates.industryMultipliersTable;
  let updatedPricelist = rates.pricelistTable;
  const compareOldSource = !sourceLangDifference;
  const compareOldTarget = !targetLangDifference;
  if (sourceLangDifference || targetLangDifference) {
    const result = await updateClientLangPairs({
      client,
      sourceLangDifference,
      targetLangDifference,
      updatedService,
      oldService,
      updatedPricelist
    });
    updatedBasicPricesTable = result.updatedBasicPricesTable;
    updatedPricelist.pricelistTable = result.updatedPricelist;
  }
  if (serviceStepDifference) {
    const result = await updateClientStepMultipliers({
      client,
      serviceStepDifference,
      updatedService,
      oldService,
      updatedPricelist,
      compareOldSource,
      compareOldTarget
    });
    updatedStepMultipliersTable = result.updatedStepMultipliersTable;
    updatedPricelist.pricelistTable = result.updatedPricelist;
  }
  if (industryDifference) {
    const result = await updateClientIndustryMultipliers({
      client,
      industryDifference,
      updatedService,
      oldService,
      updatedPricelist,
    });
    updatedIndustryMultipliersTable = result.updatedIndustryMultipliersTable;
    updatedPricelist.pricelistTable = result.updatedPricelist;
  }

  await Clients.updateOne({ _id }, {
    rates: {
      basicPricesTable: updatedBasicPricesTable,
      stepMultipliersTable: updatedStepMultipliersTable,
      industryMultipliersTable: updatedIndustryMultipliersTable,
      pricelistTable: updatedPricelist
    }
  });

  /**
   *
   * @param {ObjectId} newSourceLang - object id of a new source lang
   * @param {ObjectId} oldSourceLang - object id of an old source lang
   * @returns {null|*}
   */
  function getSourceLangDifference(newSourceLang, oldSourceLang) {
    if (newSourceLang.toString() !== oldSourceLang.toString()) {
      return newSourceLang;
    }
    return null;
  }

  /**
   *
   * @param {Array} newItemsArr
   * @param {Array} oldItemsArr
   * @returns {null | {newItem: {Object}, oldItem: {Object}}}
   */
  function getArrDifference(newItemsArr, oldItemsArr) {
    oldItemsArr = oldItemsArr.map(({ _id }) => _id);
    newItemsArr = newItemsArr.map(_id => _id.toString());
    const differenceArr = _.difference(newItemsArr, oldItemsArr);
    const oldItem = _.difference(oldItemsArr, newItemsArr)[0];
    if (differenceArr.length) {
      return { newItem: differenceArr[0], oldItem };
    }
    return null;
  }
};

/**
 *
 * @param {Object} dataToUpdate
 * @param {Array} oldServices
 * @returns {Array} - array of combinations
 */
const generateServiceCombinations = async (dataToUpdate, oldServices) => {
  const servicesCombinations = [];
  const { services: arrServices } = dataToUpdate;
  const serviceDataIds = {
    sourceLanguage: [ObjectId(dataToUpdate.sourceLanguage._id)],
    targetLanguages: dataToUpdate.targetLanguages.map(item => ObjectId(item._id)),
    services: dataToUpdate.services.map(item => ObjectId(item._id)),
    industries: dataToUpdate.industries.map(item => ObjectId(item._id)),
  };

  serviceDataIds.sourceLanguage.forEach(sourceLanguage => {
    serviceDataIds.targetLanguages.forEach(targetLanguages => {
      serviceDataIds.services.forEach(services => {
        serviceDataIds.industries.forEach(industries => {
          const isMono = arrServices.find(item => item._id === services.toString()).languageForm;
          if (isMono === 'Mono') {
            const isSame = checkForDuplicateRow(oldServices, sourceLanguage, targetLanguages, services, industries);
            if (!isSame) {
              servicesCombinations.push({ sourceLanguage: targetLanguages, targetLanguages, services, industries });
            }
          } else {
            servicesCombinations.push({ sourceLanguage, targetLanguages, services, industries });
          }
        });
      });
    });
  });
  return servicesCombinations;
};

/**
 *
 * @param {Array} oldServices - services arr
 * @param {ObjectId} newSourceLang - id of a new source language
 * @param {ObjectId} newTargetLang - id of a new target language
 * @param {ObjectId} newService - id of a new service
 * @param {ObjectId} newIndustry - id of a new industry
 * @returns {Boolean}
 */
const checkForDuplicateRow = (oldServices, newSourceLang, newTargetLang, newService, newIndustry) => {
  let isIdentical = false;
  for (let { sourceLanguage, targetLanguages, services, industries } of oldServices) {
    const isSameSource = sourceLanguage.toString() === newSourceLang.toString();
    const isSameTarget = targetLanguages.find(item => item.toString() === newTargetLang.toString());
    const isSameService = services.find(item => item.toString() === newService.toString());
    const isSameIndustry = industries.find(item => item.toString() === newIndustry.toString());
    isIdentical = isSameSource && !!isSameTarget && isSameService && !!isSameIndustry;
  }
  return isIdentical;
};

/**
 *
 * @param {Array} newServices
 * @param {Array} oldServices
 * @returns {Array} returns filtered services that fit to conditions
 */
const getUniqueServiceCombinations = (newServices, oldServices) => {
  return newServices.filter(newItem => (
    oldServices.every(oldItem => (
      newItem.sourceLanguage.toString() !== oldItem.sourceLanguage.toString() ||
      newItem.targetLanguages.toString() !== oldItem.targetLanguages[0].toString() ||
      newItem.services.toString() !== oldItem.services[0].toString() ||
      newItem.industries.toString() !== oldItem.industries[0].toString()
    ))
  ));
};

/**
 *
 * @param {Object} obj1
 * @param {Object} obj2
 * @returns {Object} returns differences of a two objects
 */
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

/**
 *
 * @param {Object} client
 * @param {Object} rowToDelete
 * @returns {Object} returns updated tables
 */
const clearClientRates = (client, rowToDelete) => {
  const { rates, services } = client;
  let { pricelistTable } = rates;
  let { sourceLanguage, targetLanguages, services: servicesToDelete, industries } = rowToDelete;
  const langPair = `${sourceLanguage._id} ${targetLanguages[0]._id}`;
  const filteredBasicPricesTable = filterRedundantLangPair(
    rates,
    services,
    rowToDelete._id,
    langPair
  );
  const filteredStepsTable = filterRedundantSteps(
    rates,
    services,
    rowToDelete._id,
    servicesToDelete[0]
  );
  const filteredIndustriesTable = filterRedundantIndustry(
    rates,
    services,
    rowToDelete._id,
    industries[0]
  );
  pricelistTable = getPricelistCombinations(
    filteredBasicPricesTable,
    filteredStepsTable,
    filteredIndustriesTable,
    pricelistTable,
    true
  );
  return {
    basicPricesTable: filteredBasicPricesTable,
    stepMultipliersTable: filteredStepsTable,
    industryMultipliersTable: filteredIndustriesTable,
    pricelistTable
  };
};

/**
 *
 * @param {Object} rates
 * @param {Array} services
 * @param {ObjectId} rowToDeleteId
 * @param {String} langPair
 * @returns {Array} returns filtered table
 */
const filterRedundantLangPair = (rates, services, rowToDeleteId, langPair) => {
  const { basicPricesTable } = rates;
  const otherServices = services.filter(row => row._id.toString() !== rowToDeleteId.toString());
  const otherLangPairs = otherServices.map(row => `${row.sourceLanguage._id} ${row.targetLanguages[0]._id}`);
  const redundantLangPairs = [];
  if (!otherLangPairs.includes(langPair)) redundantLangPairs.push(langPair);
  if (redundantLangPairs.length) {
    return basicPricesTable.filter(({ sourceLanguage, targetLanguage }) => (
      !redundantLangPairs.includes(`${sourceLanguage} ${targetLanguage}`)
    ));
  }
  return basicPricesTable;
};

/**
 *
 * @param {Object} rates
 * @param {Array} services
 * @param {ObjectId} rowToDeleteId
 * @param {Object} serviceToDelete
 * @returns {Array} returns an updated table array
 */
const filterRedundantSteps = (rates, services, rowToDeleteId, serviceToDelete) => {
  const { stepMultipliersTable } = rates;
  const otherServices = services.filter(row => row._id.toString() !== rowToDeleteId.toString());
  const stepIdsToDelete = serviceToDelete.steps.map(({ step }) => step.toString());
  let otherSteps = otherServices.map(row => row.services.map(({ steps }) => steps.map(({ step }) => step.toString())));
  otherSteps = Array.from(new Set(flatArr(otherSteps)));
  const redundantSteps = [];
  for (let step of stepIdsToDelete) {
    if (!otherSteps.includes(step)) redundantSteps.push(step);
  }
  if (redundantSteps.length) {
    return stepMultipliersTable.filter(({ step }) => !redundantSteps.includes(step.toString()));
  }
  return stepMultipliersTable;

  function flatArr (arr) {
    return arr.reduce((acc, cur) => {
      return acc.concat(Array.isArray(cur) ? flatArr(cur) : cur);
    }, []);
  }
};

/**
 *
 * @param {Object} rates
 * @param {Array} services
 * @param {ObjectId} rowToDeleteId
 * @param {Object} industryToDelete
 * @returns {Array} returns an updated table array
 */
const filterRedundantIndustry = (rates, services, rowToDeleteId, industryToDelete) => {
  const { industryMultipliersTable } = rates;
  const otherServices = services.filter(row => row._id.toString() !== rowToDeleteId.toString());
  const otherIndustries = otherServices.map(row => row.industries[0]._id);
  const redundantIndustries = [];
  if (!otherIndustries.includes(industryToDelete._id)) redundantIndustries.push(industryToDelete._id.toString());
  if (redundantIndustries.length) {
    return industryMultipliersTable.filter(({ industry }) => !redundantIndustries.includes(industry.toString()));
  }
  return industryMultipliersTable;
};

/**
 *
 * @param {Object} project
 * @param {Object} step
 * @param {Object} rate
 * @returns nothing, just updates client's rates
 */
async function getClientAfterCombinationsUpdated ({ project, step, rate }) {
  try {
    const rateInfo = await getRateInfoFromStepFinance({ project, step, rate });
    const client = await getClient({ '_id': project.customer.id });
    return await updateClientRates(client, rateInfo);
  } catch (err) {
    console.log(err);
    console.log('Error in getClientAfterCombinationsUpdated');
  }
}

module.exports = {
  updateClientRates,
  addNewRateComponents,
  updateClientRatesFromServices,
  clearClientRates,
  getStepMultipliersCombinations,
  getNeededCurrency,
  getNeededLangPair,
  getNeededStepRow,
  getPricelistCombinations,
  getObjDifferences,
  replaceOldItem,
  changePricelistTable,
  generateNewPricelistCombinations,
  getClientAfterCombinationsUpdated,
  generateServiceCombinations,
  getUniqueServiceCombinations
};
