const { Step, Services, Units } = require('../models');
const { multiplyPrices } = require('../multipliers');

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

  async function pushNewLangCombination (newService) {
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

  async function getStepMultipliers (serviceId) {
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

  function getIndustryMultipliers (industryId) {
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

  function pushNewLangPair (newSourceLanguage, newTargetLanguage, toReturn = false) {
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

  function findSameLangPair (sourceLanguage, targetLanguage) {
    return otherServices.find(row => {
      const { targetLanguages } = row;
      const otherLangPairs = targetLanguages.map(lang => `${row.sourceLanguage} - ${lang}`);
      if (otherLangPairs.includes(`${sourceLanguage} - ${targetLanguage}`)) {
        return row;
      }
    });
  }

  function replaceOldLanguage (table, newLanguage, key, needNewLangCompare = false) {
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

  function pushNewStepCombination (newService) {
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

  function getLangPairsObjs (sourceLanguage, targetLanguage) {
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

  function getIndustryMultipliers (industryId) {
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

  function pushNewSteps (newStepsArr, toReturn = false) {
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

  function deleteOldUniqueStepCombinations (indexesArr) {
    for (let index of indexesArr) {
      updatedPricelist.splice(indexesArr, 1);
    }
  }

  async function deleteOldUniqueSteps (table, stepsArr) {
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

  async function findUniqueOldSteps (serviceId) {
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

  async function findUniqOldStepCombinationIndexes (serviceId, compareOldSource, compareOldTarget) {
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

  async function findUniqueStepRows (serviceId) {
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

    function findUniqueStepTableRow (stepId, unitId) {
      return stepMultipliersTable.every(row => {
        if (row.step.toString() !== stepId.toString() || row.unit.toString() !== unitId.toString()) {
          return row;
        }
      });
    }
  }

  function findSameService (service) {
    return otherServices.find(row => {
      const serviceIdsArr = row.services.map(item => item.toString());
      if (serviceIdsArr.includes(service)) {
        return row;
      }
    });
  }
};

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

  async function pushNewLangCombination (newService) {
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

  async function getStepMultipliers (serviceId) {
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

  function getLangPairsObjs (sourceLanguage, targetLanguage) {
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

  function pushNewIndustry (toReturn = false) {
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

  function findSameIndustry (industry) {
    return otherServices.find(row => {
      const industryIdsArr = row.industries.map(item => item.toString());
      if (industryIdsArr.includes(industry)) {
        return row;
      }
    });
  }

  function replaceOldIndustry (table, newIndustry, oldIndustry) {
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
