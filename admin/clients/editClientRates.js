const { Step, Services, Units } = require('../models');
const { multiplyPrices } = require('../multipliers');

/**
 *
 * @param {Object} operationObj
 * @returns {Object} returns an updated basic prices table and
 */
const updateClientLangPairs = async (operationObj) => {
  let { client, sourceLangDifference, targetLangDifference, updatedService, oldService, updatedPricelist } = operationObj;
  const { services, rates, defaultPricelist, currency } = client;
  let { basicPricesTable } = rates;
  const otherServices = services.filter(({ _id }) => _id.toString() !== oldService._id.toString());
  if (sourceLangDifference) {
    let newSourceLanguage = sourceLangDifference;
    const sameOldLangPairExists = findSameLangPair(oldService.sourceLanguage._id, oldService.targetLanguages[0]._id);
    const sameNewLangPairExists = findSameLangPair(newSourceLanguage, updatedService.targetLanguages[0]);
    if (!sameOldLangPairExists && !sameNewLangPairExists) {
      basicPricesTable = replaceOldLanguage(basicPricesTable, newSourceLanguage, 'sourceLanguage');
      updatedPricelist = replaceOldLanguage(updatedPricelist, newSourceLanguage, 'sourceLanguage');
    } else if (!sameOldLangPairExists && sameNewLangPairExists) {
      basicPricesTable = basicPricesTable.filter(row => (
        `${row.sourceLanguage} ${row.targetLanguage}` !== `${oldService.sourceLanguage._id} ${oldService.targetLanguages[0]._id}`
      ));
      updatedPricelist = replaceOldLanguage(updatedPricelist, newSourceLanguage, 'sourceLanguage');
    } else if (sameOldLangPairExists && !sameNewLangPairExists) {
      pushNewLangPair(newSourceLanguage, updatedService.targetLanguages[0]);
      await pushNewLangCombination(updatedService);
    }
  }
  if (targetLangDifference) {
    const { newItem: newTargetLanguage, oldItem } = targetLangDifference;
    const sameOldLangPairExists = findSameLangPair(oldService.sourceLanguage._id, oldItem);
    const sameNewLangPairExists = findSameLangPair(updatedService.sourceLanguage, newTargetLanguage);
    const needNewLanguageCompare = !!sourceLangDifference;
    if (!sameOldLangPairExists && !sameNewLangPairExists) {
      basicPricesTable = replaceOldLanguage(basicPricesTable, newTargetLanguage, 'targetLanguage', needNewLanguageCompare);
      updatedPricelist = replaceOldLanguage(updatedPricelist, newTargetLanguage, 'targetLanguage');
    } else if (!sameOldLangPairExists && sameNewLangPairExists) {
      basicPricesTable = basicPricesTable.filter(row => (
        `${row.sourceLanguage} ${row.targetLanguage}` !== `${oldService.sourceLanguage._id} ${oldService.targetLanguages[0]._id}`
      ));
      updatedPricelist = replaceOldLanguage(updatedPricelist, newTargetLanguage, 'targetLanguage', needNewLanguageCompare);
    } else if (sameOldLangPairExists && !sameNewLangPairExists) {
      pushNewLangPair(updatedService.sourceLanguage, newTargetLanguage);
      await pushNewLangCombination(updatedService);
    }
  }

  return { updatedBasicPricesTable: basicPricesTable, updatedPricelist };

  /**
   *
   * @param {Object} newService
   * @returns nothing - pushes new combinations into pricelist table
   */
  async function pushNewLangCombination(newService) {
    const { sourceLanguage, targetLanguages, services, industries } = newService;
    const langPairCombinations = pushNewLangPair(sourceLanguage, targetLanguages[0], true);
    const stepMultiplierCombinations = await getStepMultipliers(services[0]);
    const industryMultiplierCombinations = getIndustryMultipliers(industries[0]);
    langPairCombinations.forEach(langRow => {
      stepMultiplierCombinations.forEach(stepRow => {
        industryMultiplierCombinations.forEach(industryRow => {
          updatedPricelist.push({
            sourceLanguage: langRow.sourceLanguage,
            targetLanguage: langRow.targetLanguage,
            step: stepRow.step,
            unit: stepRow.unit,
            size: stepRow.size,
            industry: industryRow.industry,
            price: multiplyPrices(langRow.basicPrice, stepRow.multiplier, stepRow.size, industryRow.multiplier)
          });
        });
      });
    });
  }

  /**
   *
   * @param {ObjectId}serviceId
   * @returns {Array} - returns an array of step multipliers
   */
  async function getStepMultipliers(serviceId) {
    const stepMultipliers = [];
    const { steps } = await Services.findOne({ _id: serviceId });
    for (let i = 0; i < steps.length; i++) {
      const { step: stepId } = steps[i];
      const { calculationUnit } = await Step.findOne({ _id: stepId }).populate('calculationUnit');
      for (let { _id: unitId } of calculationUnit) {
        const { sizes } = await Units.findOne({ _id: unitId });
        if (sizes.length) {
          for (let size of sizes) {
            const row = defaultPricelist.stepMultipliersTable.find(row => (
              `${row.step} ${row.unit} ${row.size}` === `${stepId} ${unitId} ${size}`
            ));
            stepMultipliers.push({
              step: stepId,
              unit: unitId,
              size,
              multiplier: row ? row.multiplier : 100,
            });
          }
        } else {
          const row = defaultPricelist.stepMultipliersTable.find(row => (
            `${row.step} ${row.unit} ${row.size}` === `${stepId} ${unitId} ${1}`
          ));
          stepMultipliers.push({
            step: stepId,
            unit: unitId,
            size: 1,
            multiplier: row ? row.multiplier : 100,
          });
        }
      }
    }
    return stepMultipliers;
  }

  /**
   *
   * @param {ObjectId} industryId
   * @returns {Array} returns an array of industry multipliers
   */
  function getIndustryMultipliers(industryId) {
    const industryMultipliers = [];
    const sameDefaultIndustryRow = defaultPricelist.industryMultipliersTable.find(({ industry }) => (
      industry.toString() === industryId.toString()
    ));
    industryMultipliers.push({
      industry: industryId,
      multiplier: sameDefaultIndustryRow ? sameDefaultIndustryRow.multiplier : 100
    });
    return industryMultipliers;
  }

  /**
   *
   * @param {ObjectId} newSourceLanguage
   * @param {ObjectId} newTargetLanguage
   * @param {Boolean} toReturn - boolean value which decides return array or not
   * @returns {Array} - also depends on toReturn value
   */
  function pushNewLangPair(newSourceLanguage, newTargetLanguage, toReturn = false) {
    const sameDefaultPair = defaultPricelist.basicPricesTable.find(row => (
      `${row.sourceLanguage} ${row.targetLanguage}` === `${newSourceLanguage} ${newTargetLanguage}`
    ));
    let basicPrice = 1;
    if (sameDefaultPair) {
      switch (currency) {
        case 'USD':
          basicPrice = sameDefaultPair.usdBasicPrice;
          break;
        case 'GBP':
          basicPrice = sameDefaultPair.gbpBasicPrice;
          break;
        default:
          basicPrice = sameDefaultPair.euroBasicPrice;
      }
      if (toReturn) {
        return [{
          sourceLanguage: newSourceLanguage,
          targetLanguage: updatedService.targetLanguages[0],
          basicPrice
        }];
      }
      basicPricesTable.push({
        sourceLanguage: newSourceLanguage,
        targetLanguage: updatedService.targetLanguages[0],
        basicPrice
      });
    } else {
      if (toReturn) {
        return [{
          sourceLanguage: newSourceLanguage,
          targetLanguage: updatedService.targetLanguages[0],
          basicPrice: 1
        }];
      }
      basicPricesTable.push({
        sourceLanguage: newSourceLanguage,
        targetLanguage: updatedService.targetLanguages[0],
        basicPrice: 1
      });
    }
  }

  /**
   *
   * @param {ObjectId} sourceLanguage
   * @param {ObjectId} targetLanguage
   * @returns {Object} returns fitting row
   */
  function findSameLangPair(sourceLanguage, targetLanguage) {
    return otherServices.find(row => {
      const { targetLanguages } = row;
      const otherLangPairs = targetLanguages.map(lang => `${row.sourceLanguage} - ${lang}`);
      if (otherLangPairs.includes(`${sourceLanguage} - ${targetLanguage}`)) {
        return row;
      }
    });
  }

  /**
   *
   * @param {Array} table
   * @param {ObjectId} newLanguage
   * @param {String} key - key name to get value
   * @param {Boolean} needNewLangCompare - affects on comparing source language value
   * @returns {Array} returns changed array
   */
  function replaceOldLanguage(table, newLanguage, key, needNewLangCompare = false) {
    return table.map(row => {
      const { sourceLanguage, targetLanguage } = row;
      if (`${sourceLanguage} ${targetLanguage}` === `${needNewLangCompare ?
        updatedService.sourceLanguage : oldService.sourceLanguage._id} ${oldService.targetLanguages[0]._id}`) {
        row[key] = newLanguage;
      }
      return row;
    });
  }
};

/**
 *
 * @param {Object} operationObj
 * @returns {Object} returns updated step multipliers and pricelist tables
 */
const updateClientStepMultipliers = async (operationObj) => {
  const {
    client, serviceStepDifference, oldService, updatedService, updatedPricelist, compareOldSource,
    compareOldTarget
  } = operationObj;
  const { services, rates, defaultPricelist, currency } = client;
  let { stepMultipliersTable } = rates;
  const { newItem: newService, oldItem } = serviceStepDifference;
  const otherServices = services.filter(({ _id }) => _id.toString() !== oldService._id.toString());
  const sameOldServiceExists = findSameService(oldItem);
  const sameNewServiceExists = findSameService(newService);
  const newUniqueStepRows = await findUniqueStepRows(newService);
  const oldUniqueStepRows = await findUniqueOldSteps(oldItem);
  const oldUniqueStepCombinationIndexesArr = await findUniqOldStepCombinationIndexes(oldItem, compareOldSource, compareOldTarget);
  if (!sameOldServiceExists && !sameNewServiceExists) {
    if (oldUniqueStepCombinationIndexesArr.length) {
      deleteOldUniqueStepCombinations(oldUniqueStepCombinationIndexesArr);
    }
    if (oldUniqueStepRows.length) {
      stepMultipliersTable = await deleteOldUniqueSteps(stepMultipliersTable, oldUniqueStepRows);
    }
    if (newUniqueStepRows.length) {
      pushNewSteps(newUniqueStepRows);
      await pushNewStepCombination(updatedService);
    }
  } else if (sameOldServiceExists && !sameNewServiceExists) {
    if (newUniqueStepRows.length) {
      pushNewSteps(newUniqueStepRows);
      await pushNewStepCombination(updatedService);
    }
  } else if (!sameOldServiceExists && sameNewServiceExists) {
    if (oldUniqueStepCombinationIndexesArr.length) {
      deleteOldUniqueStepCombinations(oldUniqueStepCombinationIndexesArr);
    }
    if (oldUniqueStepRows.length) {
      stepMultipliersTable = await deleteOldUniqueSteps(stepMultipliersTable, oldUniqueStepRows);
    }
  }

  return { updatedStepMultipliersTable: stepMultipliersTable, updatedPricelist };

  /**
   *
   * @param {Object} newService
   */
  function pushNewStepCombination(newService) {
    const { sourceLanguage, targetLanguages, industries } = newService;
    const langPairCombinations = getLangPairsObjs(sourceLanguage, targetLanguages[0]);
    const stepMultiplierCombinations = pushNewSteps(newUniqueStepRows, true);
    const industryMultiplierCombinations = getIndustryMultipliers(industries[0]);
    langPairCombinations.forEach(langRow => {
      stepMultiplierCombinations.forEach(stepRow => {
        industryMultiplierCombinations.forEach(industryRow => {
          updatedPricelist.push({
            sourceLanguage: langRow.sourceLanguage,
            targetLanguage: langRow.targetLanguage,
            step: stepRow.step,
            unit: stepRow.unit,
            size: stepRow.size,
            industry: industryRow.industry,
            price: multiplyPrices(langRow.basicPrice, stepRow.multiplier, stepRow.size, industryRow.multiplier)
          });
        });
      });
    });
  }

  /**
   *
   * @param {ObjectId} sourceLanguage
   * @param {ObjectId} targetLanguage
   * @returns {Array} returns an array of needed lang pairs and their cost
   */
  function getLangPairsObjs(sourceLanguage, targetLanguage) {
    const sameDefaultPair = defaultPricelist.basicPricesTable.find(row => (
      `${row.sourceLanguage} ${row.targetLanguage}` === `${sourceLanguage} ${targetLanguage}`
    ));
    let basicPrice = 1;
    if (sameDefaultPair) {
      switch (currency) {
        case 'USD':
          basicPrice = sameDefaultPair.usdBasicPrice;
          break;
        case 'GBP':
          basicPrice = sameDefaultPair.gbpBasicPrice;
          break;
        default:
          basicPrice = sameDefaultPair.euroBasicPrice;
      }
      return [{
        sourceLanguage,
        targetLanguage,
        basicPrice
      }];
    } else {
      return [{
        sourceLanguage,
        targetLanguage,
        basicPrice: 1
      }];
    }
  }

  /**
   *
   * @param {ObjectId} industryId
   * @returns {Array} returns industry multipliers array
   */
  function getIndustryMultipliers(industryId) {
    const industryMultipliers = [];
    const sameDefaultIndustryRow = defaultPricelist.industryMultipliersTable.find(({ industry }) => (
      industry.toString() === industryId.toString()
    ));
    industryMultipliers.push({
      industry: industryId,
      multiplier: sameDefaultIndustryRow ? sameDefaultIndustryRow.multiplier : 100
    });
    return industryMultipliers;
  }

  /**
   *
   * @param {Array} newStepsArr
   * @param {Boolean} toReturn - affects on rather function needs to return or not
   * @returns {Array} if toReturn = true - returns array of step multipliers or just pushes combinations in existing array
   */
  function pushNewSteps(newStepsArr, toReturn = false) {
    let arrToReturn = [];
    for (let { stepId, unitId, size } of newStepsArr) {
      const row = defaultPricelist.stepMultipliersTable.find(row => (
        `${row.step} ${row.unit} ${row.size}` === `${stepId} ${unitId} ${size}`
      ));
      if (toReturn) {
        arrToReturn.push({
          step: stepId,
          unit: unitId,
          size,
          multiplier: row ? row.multiplier : 100,
        });
      } else {
        stepMultipliersTable.push({
          step: stepId,
          unit: unitId,
          size,
          multiplier: row ? row.multiplier : 100,
        });
      }
    }
    return arrToReturn;
  }

  /**
   *
   * @param {Array} indexesArr
   */
  function deleteOldUniqueStepCombinations(indexesArr) {
    for (let index of indexesArr) {
      updatedPricelist.splice(indexesArr, 1);
    }
  }

  /**
   *
   * @param {Array} table
   * @param {Array} stepsArr
   * @returns {Array} returns filtered table
   */
  async function deleteOldUniqueSteps(table, stepsArr) {
    const stepCombinationRows = [];
    for (let step of stepsArr) {
      const { calculationUnit } = await Step.findOne({ _id: step }).populate('calculationUnit');
      for (let { _id: unitId, sizes } of calculationUnit) {
        if (sizes.length) {
          for (let size of sizes) {
            stepCombinationRows.push(`${step} ${unitId} ${size}`);
          }
        } else {
          stepCombinationRows.push(`${step} ${unitId} ${1}`);
        }
      }
    }
    return table.filter(row => (
      !stepCombinationRows.includes(`${row.step} ${row.unit} ${row.size}`)
    ));
  }

  /**
   *
   * @param {ObjectId} serviceId
   * @returns {Array} - returns unique step rows
   */
  async function findUniqueOldSteps(serviceId) {
    let uniqueStepRows = [];
    const otherServiceSteps = [];
    const clientServicesFromServicesArr = otherServices.map(({ services }) => services);
    for (let service of clientServicesFromServicesArr) {
      const { steps } = await Services.findOne({ _id: service });
      steps.forEach(({ step }) => otherServiceSteps.push(step.toString()));
    }
    const { steps } = await Services.findOne({ _id: serviceId });
    for (let { step } of steps) {
      if (!otherServiceSteps.includes(step.toString())) {
        uniqueStepRows.push(step);
      }
    }
    return uniqueStepRows;
  }

  /**
   *
   * @param {ObjectId} serviceId
   * @param {Boolean} compareOldSource - affects on comparing item
   * @param {Boolean} compareOldTarget - affects on comparing item
   * @returns {Array} returns unique indexes of step combinations
   */
  async function findUniqOldStepCombinationIndexes(serviceId, compareOldSource, compareOldTarget) {
    const uniqueOldStepCombinationIndexes = [];
    const { steps } = await Services.findOne({ _id: serviceId });
    for (let { step: serviceStep } of steps) {
      for (let i = 0; i < updatedPricelist.length; i++) {
        const { sourceLanguage, targetLanguage, step } = updatedPricelist[i];
        if (!compareOldSource ? oldService.sourceLanguage._id.toString() : updatedService.sourceLanguage.toString() === sourceLanguage.toString()
        && !compareOldTarget ? oldService.targetLanguages[0]._id.toString() : updatedService.targetLanguages[0].toString() === targetLanguage.toString()
          && serviceStep.toString() === step.toString()) {
          uniqueOldStepCombinationIndexes.push(i);
        }
      }
    }
    return uniqueOldStepCombinationIndexes;
  }

  /**
   *
   * @param {ObjectId} serviceId
   * @returns {Array} - returns unique step rows
   */
  async function findUniqueStepRows(serviceId) {
    let uniqueStepRows = [];
    const { steps } = await Services.findOne({ _id: serviceId });
    for (let i = 0; i < steps.length; i++) {
      const { step: stepId } = steps[i];
      const { calculationUnit } = await Step.findOne({ _id: stepId }).populate('calculationUnit');
      for (let { _id: unitId } of calculationUnit) {
        const { sizes } = await Units.findOne({ _id: unitId });
        if (sizes.length) {
          for (let size of sizes) {
            const uniqueRow = findUniqueStepTableRow(stepId, unitId);
            uniqueRow && uniqueStepRows.push({ stepId, unitId, size });
          }
        } else {
          const uniqueRow = findUniqueStepTableRow(stepId, unitId);
          uniqueRow && uniqueStepRows.push({ stepId, unitId, size: 1 });
        }
      }
    }
    return uniqueStepRows;

    /**
     *
     * @param {ObjectId} stepId
     * @param {ObjectId} unitId
     * @returns {Boolean} - returns that every item fits the conditions
     */
    function findUniqueStepTableRow(stepId, unitId) {
      return stepMultipliersTable.every(row => {
        if (row.step.toString() !== stepId.toString() || row.unit.toString() !== unitId.toString()) {
          return row;
        }
      });
    }
  }

  /**
   *
   * @param {ObjectId} service
   * @returns {Object} - returns fitting row
   */
  function findSameService(service) {
    return otherServices.find(row => {
      const serviceIdsArr = row.services.map(item => item.toString());
      if (serviceIdsArr.includes(service)) {
        return row;
      }
    });
  }
};

/**
 *
 * @param {Object} operationObj
 * @returns {Object} returns updated industry and pricelist tables
 */
const updateClientIndustryMultipliers = async (operationObj) => {
  let { client, industryDifference, oldService, updatedService, updatedPricelist } = operationObj;
  const { services, rates, defaultPricelist, currency } = client;
  let { industryMultipliersTable } = rates;
  const { newItem: newIndustry, oldItem } = industryDifference;
  const otherServices = services.filter(({ _id }) => _id.toString() !== oldService._id.toString());
  const sameOldIndustryExists = findSameIndustry(oldItem);
  const sameNewIndustryExists = findSameIndustry(newIndustry);
  if (!sameOldIndustryExists && !sameNewIndustryExists) {
    industryMultipliersTable = replaceOldIndustry(industryMultipliersTable, newIndustry, oldItem);
    updatedPricelist = replaceOldIndustry(updatedPricelist, newIndustry, oldItem);
  } else if (!sameOldIndustryExists && sameNewIndustryExists) {
    industryMultipliersTable = industryMultipliersTable.filter(row => (
      row.industry.toString() !== oldService.industries[0]._id.toString()
    ));
    updatedPricelist = replaceOldIndustry(updatedPricelist, newIndustry, oldItem);
  } else if (sameOldIndustryExists && !sameNewIndustryExists) {
    pushNewIndustry();
    await pushNewLangCombination(updatedService);
  }

  return { updatedIndustryMultipliersTable: industryMultipliersTable, updatedPricelist };

  /**
   *
   * @param {Object} newService
   * @returns nothing - just pushes rows into existing array
   */
  async function pushNewLangCombination(newService) {
    const { sourceLanguage, targetLanguages, services } = newService;
    const langPairCombinations = getLangPairsObjs(sourceLanguage, targetLanguages[0]);
    const stepMultiplierCombinations = await getStepMultipliers(services[0]);
    const industryMultiplierCombinations = pushNewIndustry(true);
    langPairCombinations.forEach(langRow => {
      stepMultiplierCombinations.forEach(stepRow => {
        industryMultiplierCombinations.forEach(industryRow => {
          updatedPricelist.push({
            sourceLanguage: langRow.sourceLanguage,
            targetLanguage: langRow.targetLanguage,
            step: stepRow.step,
            unit: stepRow.unit,
            size: stepRow.size,
            industry: industryRow.industry,
            price: multiplyPrices(langRow.basicPrice, stepRow.multiplier, stepRow.size, industryRow.multiplier)
          });
        });
      });
    });
  }

  /**
   *
   * @param {ObjectId} serviceId
   * @returns {Array} returns fullfilled array of step multipliers
   */
  async function getStepMultipliers(serviceId) {
    const stepMultipliers = [];
    const { steps } = await Services.findOne({ _id: serviceId });
    for (let i = 0; i < steps.length; i++) {
      const { step: stepId } = steps[i];
      const { calculationUnit } = await Step.findOne({ _id: stepId }).populate('calculationUnit');
      for (let { _id: unitId } of calculationUnit) {
        const { sizes } = await Units.findOne({ _id: unitId });
        if (sizes.length) {
          for (let size of sizes) {
            const row = defaultPricelist.stepMultipliersTable.find(row => (
              `${row.step} ${row.unit} ${row.size}` === `${stepId} ${unitId} ${size}`
            ));
            stepMultipliers.push({
              step: stepId,
              unit: unitId,
              size,
              multiplier: row ? row.multiplier : 100,
            });
          }
        } else {
          const row = defaultPricelist.stepMultipliersTable.find(row => (
            `${row.step} ${row.unit} ${row.size}` === `${stepId} ${unitId} ${1}`
          ));
          stepMultipliers.push({
            step: stepId,
            unit: unitId,
            size,
            multiplier: row ? row.multiplier : 100,
          });
        }
      }
    }
    return stepMultipliers;
  }

  /**
   *
   * @param {ObjectId} sourceLanguage
   * @param {ObjectId} targetLanguage
   * @returns {Array} - returns lang pair and their cost
   */
  function getLangPairsObjs(sourceLanguage, targetLanguage) {
    const sameDefaultPair = defaultPricelist.basicPricesTable.find(row => (
      `${row.sourceLanguage} ${row.targetLanguage}` === `${sourceLanguage} ${targetLanguage}`
    ));
    let basicPrice = 1;
    if (sameDefaultPair) {
      switch (currency) {
        case 'USD':
          basicPrice = sameDefaultPair.usdBasicPrice;
          break;
        case 'GBP':
          basicPrice = sameDefaultPair.gbpBasicPrice;
          break;
        default:
          basicPrice = sameDefaultPair.euroBasicPrice;
      }
      return [{
        sourceLanguage,
        targetLanguage,
        basicPrice
      }];
    }
  }

  /**
   *
   * @param {Boolean} toReturn
   * @returns {Array | } - if toReturn = true - returns industries and their multipliers array
   */
  function pushNewIndustry(toReturn = false) {
    const arrToReturn = [];
    const sameDefaultIndustryRow = defaultPricelist.industryMultipliersTable.find(({ industry }) => (
      industry.toString() === newIndustry.toString()
    ));
    if (toReturn) {
      arrToReturn.push({
        industry: newIndustry,
        multiplier: sameDefaultIndustryRow ? sameDefaultIndustryRow.multiplier : 100
      });
    }
    industryMultipliersTable.push({
      industry: newIndustry,
      multiplier: sameDefaultIndustryRow ? sameDefaultIndustryRow.multiplier : 100
    });
    return arrToReturn;
  }

  /**
   *
   * @param {ObjectId} industry
   * @returns {Object} returns fitting row
   */
  function findSameIndustry(industry) {
    return otherServices.find(row => {
      const industryIdsArr = row.industries.map(item => item.toString());
      if (industryIdsArr.includes(industry)) {
        return row;
      }
    });
  }

  /**
   *
   * @param {Array} table
   * @param {ObjectId} newIndustry
   * @param {ObjectId} oldIndustry
   * @returns {Array} - returns updated table
   */
  function replaceOldIndustry(table, newIndustry, oldIndustry) {
    return table.map(row => {
      const { industry } = row;
      if (industry.toString() === oldIndustry.toString()) {
        row.industry = newIndustry;
      }
      return row;
    });
  }
};

module.exports = {
  updateClientLangPairs,
  updateClientStepMultipliers,
  updateClientIndustryMultipliers,
};
