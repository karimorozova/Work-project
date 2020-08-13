const { Vendors, Pricelist } = require('../models');
const { generateNewStepCombinations } = require('../clients/editClientRates');
const { getPricelistCombinations, replaceOldItem, changePricelistTable } = require('../clients');
const { tableKeys } = require('../enums');

const updateVendorRatesFromCompetence = async (vendorId, newData, oldData) => {
  const vendor = await Vendors.findOne({ _id: vendorId });
  const defaultPricelist = await Pricelist.findOne({ isDefault: true });
  const sourceLangDifference = compareIds(newData.sourceLanguage, oldData.sourceLanguage);
  const targetLangDifference = compareIds(newData.targetLanguage, oldData.targetLanguage);
  const stepDifference = compareIds(newData.step, oldData.step);
  const industryDifference = compareIds(newData.industry, oldData.industry);
  if (sourceLangDifference || targetLangDifference) {
    await updateVendorLangPairs(
      oldData.sourceLanguage._id,
      oldData.targetLanguage._id,
      sourceLangDifference,
      targetLangDifference._id,
      vendor,
      defaultPricelist
    );
  }
  if (stepDifference) {
    await updateVendorStep(oldData.step._id, newData.step, vendor, defaultPricelist);
  }
  if (industryDifference) {
    await updateVendorIndustry(oldData.industry._id, newData.industry, vendor, defaultPricelist);
  }

  function compareIds(obj1, obj2) {
    return obj1._id.toString() !== obj2._id.toString() ? obj1 : undefined;
  }
};

const updateVendorLangPairs = async (oldSourceId, oldTargetId, newSourceLang, newTargetId, vendor, defaultPricelist) => {
  const { _id, rates, competencies } = vendor;
  let updatedRates = rates;
  if (newSourceLang) {
    updatedRates.basicPricesTable = changeOrPush(
      competencies,
      updatedRates.basicPricesTable,
      oldSourceId,
      oldTargetId,
      newSourceLang._id,
      tableKeys.basicPricesTable
    );
    updatedRates.pricelistTable = changeOrPush(
      competencies,
      updatedRates.pricelistTable,
      oldSourceId,
      oldTargetId,
      newSourceLang._id,
      tableKeys.pricelistTable
    );
    updatedRates.basicPricesTable = syncDefaultPricelistSourcePrices(
      updatedRates.basicPricesTable,
      newSourceLang._id,
      defaultPricelist,
      'basicPrice'
    );
    updatedRates.pricelistTable = syncDefaultPricelistSourcePrices(
      updatedRates.pricelistTable,
      newSourceLang._id,
      defaultPricelist,
      'price'
    );
  }
  if (newTargetId) {
    oldSourceId = newSourceLang ? newSourceLang._id : oldSourceId;
    updatedRates.basicPricesTable = replaceByLangPair(updatedRates.basicPricesTable, oldSourceId, oldTargetId, newTargetId);
    updatedRates.pricelistTable = replaceByLangPair(updatedRates.pricelistTable, oldSourceId, oldTargetId, newTargetId);
    updatedRates.basicPricesTable = syncDefaultPricelistTargetPrices(
      updatedRates.basicPricesTable,
      newTargetId,
      oldSourceId,
      defaultPricelist,
      'basicPrice'
    );
    updatedRates.pricelistTable = syncDefaultPricelistTargetPrices(
      updatedRates.pricelistTable,
      newTargetId,
      oldSourceId,
      defaultPricelist,
      'price'
    );

    await Vendors.updateOne({ _id }, { rates: updatedRates });

    function changeOrPush(competencies, arr, idToSearch, targetLangId, idForReplace, tableKey) {
      const sameSourceIds = competencies.filter(item => item.sourceLanguage.toString() === idToSearch.toString());
      if (sameSourceIds.length > 2) {
        const defaultBasicPrice = findSameBasicPriceInDefault(defaultPricelist, idToSearch, targetLangId);
        const itemToPush = tableKey === tableKeys.pricelistTable ?
          {
            type: idToSearch.toString() === targetLangId.toString() ? 'Mono' : 'Duo',
            sourceLanguage: idToSearch,
            targetLanguage: targetLangId,
            basicPrice: defaultBasicPrice ? defaultBasicPrice : 1
          } :
          {
            sourceLanguage: idToSearch,

          };
        arr.push({});
      }
      return arr.map(item => {
        if (item.sourceLanguage.toString() === idToSearch.toString()) {
          item.sourceLanguage = idForReplace;
        }
        return item;
      });
    }

    function replaceByLangPair(arr, sourceLangId, oldTargetId, newTargetLangId) {
      return arr.map(item => {
        if (`${item.sourceLanguage} ${item.targetLanguage}` === `${sourceLangId} ${oldTargetId}`) {
          item.targetLanguage = newTargetLangId;
        }
        return item;
      });
    }

    function syncDefaultPricelistSourcePrices(arr, newSourceLangId, defaultPricelist, priceKey) {
      return arr.map(item => {
        const defaultItem = defaultPricelist.basicPricesTable.find(item => (
          item.sourceLanguage.toString() === newSourceLangId
        ));
        if (item.sourceLanguage.toString() === newSourceLangId && !!defaultItem) {
          item[priceKey] = defaultItem[priceKey];
        }
        return item;
      });
    }

    function syncDefaultPricelistTargetPrices(arr, newTargetLangId, sourceLangId, defaultPricelist, priceKey) {
      return arr.map(item => {
        const defaultItem = defaultPricelist.basicPricesTable.find(({ sourceLanguage, targetLanguage }) => (
          `${sourceLanguage} ${targetLanguage}` === `${sourceLangId} ${newTargetLangId}`
        ));
        if (`${item.sourceLanguage} ${item.targetLanguage}` === `${sourceLangId} ${newTargetLangId}` && !!defaultItem) {
          item[priceKey] = defaultItem[priceKey];
        }
        return item;
      });
    }
  }

  function findSameBasicPriceInDefault(defaultPricelist, sourceLanguage, targetLanguage) {
    const { basicPrice } = defaultPricelist.basicPricesTable.find(item => (
      `${item.sourceLanguage} ${item.targetLanguage}` === `${sourceLanguage} ${targetLanguage}`
    ));
    return basicPrice;
  }
};

const updateVendorStep = async (oldStepId, newStep, vendor, defaultPricelist) => {
  const { _id, rates } = vendor;
  let updatedRates = rates;
  updatedRates = deleteRedundantSteps(updatedRates, newStep._id, oldStepId);
  updatedRates = pushNewStepCombinations(updatedRates, newStep, defaultPricelist);
  const duplicatesArr = checkForDuplicates(updatedRates.stepMultipliersTable, newStep._id, oldStepId);
  if (duplicatesArr.length) {
    return await Vendors.updateOne({ _id }, { rates });
  }

  await Vendors.updateOne({ _id }, { rates: updatedRates });

  function deleteRedundantSteps(rates, oldStepId) {
    return {
      ...rates,
      stepMultipliersTable: rates.stepMultipliersTable.filter(item => item.step.toString() !== oldStepId.toString()),
      pricelistTable: rates.pricelistTable.filter(item => item.step.toString() !== oldStepId.toString()),
    };
  }

  function pushNewStepCombinations(rates, newStep, defaultPricelist) {
    const { basicPricesTable, stepMultipliersTable, industryMultipliersTable, pricelistTable } = rates;
    const { calculationUnit } = newStep;
    if (!calculationUnit.length) return rates;
    for (let { _id: unitId } of calculationUnit) {
      const sizes = calculationUnit.hasOwnProperty('sizes') ? calculationUnit.sizes : [];
      if (sizes.length) {
        sizes.forEach(size => {
          const neededStepRow = defaultPricelist.stepMultipliersTable.find(item => (
            `${item.step} ${item.unit} ${item.size}` === `${newStep._id} ${unitId} ${size}`
          ));
          const multiplier = neededStepRow ? neededStepRow.multipart : 100;
          stepMultipliersTable.push({
            step: newStep._id,
            unit: unitId,
            size,
            multiplier
          });
        });
      } else {
        const neededStepRow = defaultPricelist.stepMultipliersTable.find(item => (
          `${step} ${unit}` === `${_id} ${unitId}`
        ));
        const multiplier = neededStepRow ? neededStepRow.multiplier : 100;
        stepMultipliersTable.push({
          step: newStep._id,
          unit: unitId,
          size: 1,
          multiplier
        });
      }
      pricelistTable.push(...generateNewStepCombinations(basicPricesTable, industryMultipliersTable, _id, unitId));
    }
    return {
      basicPricesTable,
      stepMultipliersTable,
      industryMultipliersTable,
      pricelistTable
    };
  }
};

const updateVendorIndustry = async (oldIndustryId, newIndustry, vendor, defaultPricelist) => {
  const { _id, rates } = vendor;
  let updatedRates = rates;
  const duplicatesArr = checkForDuplicates(updatedRates.industryMultipliersTable, newIndustry._id, oldIndustryId);
  if (duplicatesArr.length) {
    await Vendors.updateOne({ _id }, { rates });
  }
  updatedRates = deleteRedundantIndustries(updatedRates, oldIndustryId);
  updatedRates = pushNewIndustryCombinations(updatedRates, newIndustry._id);

  await Vendors.updateOne({ _id }, { rates: updatedRates });

  function deleteRedundantIndustries(rates, oldIndustryId) {
    return {
      ...rates,
      industryMultipliersTable: rates.industryMultipliersTable.filter(item => (
        item.industry.toString() !== oldIndustryId.toString()
      )),
      pricelistTable: rates.pricelistTable.filter(item => item.industry.toString() !== oldIndustryId.toString())
    };
  }

  async function pushNewIndustryCombinations(rates, newIndustryId) {
    let { basicPricesTable, stepMultipliersTable, industryMultipliersTable, pricelistTable } = rates;
    const neededIndustryRow = defaultPricelist.industryMultipliersTable.find(({ industry }) => (
      industry.toString() === newIndustryId.toString()
    ));
    const multiplier = neededIndustryRow.multiplier ? neededIndustryRow.multiplier : 100;
    industryMultipliersTable.push({
      industry: newIndustryId,
      multiplier
    });
    pricelistTable = await getPricelistCombinations(
      basicPricesTable,
      stepMultipliersTable,
      industryMultipliersTable,
      pricelistTable,
    );
    return {
      basicPricesTable,
      stepMultipliersTable,
      industryMultipliersTable,
      pricelistTable
    };
  }
};

const checkForDuplicates = (arr, newItemId, oldItemId, key) => {
  const itemsForCheck = arr
    .filter(item => item[key].toString() !== oldItemId.toString())
    .map(item => item[key]);
  return itemsForCheck.find(id => id === newItemId);
};

const updateVendorsRatePrices = async (vendorId, itemIdentifier, updatedItem) => {
  const vendor = await Vendors.findOne({ _id: vendorId });
  const defaultPricelist = await Pricelist.findOne({ isDefault: true });
  const { basicPricesTable, stepMultipliersTable, industryMultipliersTable, pricelistTable } = vendor.rates;
  let updatedPricelistTable;
  switch (itemIdentifier) {
    default:
    case tableKeys.basicPricesTable:
      const { basicPrice } = basicPricesTable.find(item => item._id.toString() === updatedItem._id.toString());
      if (basicPrice === Number(updatedItem.basicPrice)) return;
      const updatedBasicPricesTable = replaceOldItem(
        basicPricesTable,
        updatedItem,
        defaultPricelist,
        tableKeys.basicPricesTable,
        'Vendor');
      updatedPricelistTable = changePricelistTable(
        basicPricesTable,
        stepMultipliersTable,
        industryMultipliersTable,
        pricelistTable,
        updatedItem,
        itemIdentifier
      );
      vendor.rates.basicPricesTable = updatedBasicPricesTable;
      vendor.rates.pricelistTable = updatedPricelistTable;
      await Vendors.updateOne({ _id: vendorId }, { rates: vendor.rates });
      break;
    case tableKeys.stepMultipliersTable:
      const { multiplier: stepMultiplier } = stepMultipliersTable.find(item => item._id.toString() === updatedItem._id.toString());
      if (stepMultiplier === Number(updatedItem.multiplier)) return;
      const updatedStepMultipliersTable = replaceOldItem(
        stepMultipliersTable,
        updatedItem,
        defaultPricelist,
        tableKeys.stepMultipliersTable,
        'Vendor'
      );
      updatedPricelistTable = changePricelistTable(
        basicPricesTable,
        stepMultipliersTable,
        industryMultipliersTable,
        pricelistTable,
        updatedItem,
        itemIdentifier
      );
      vendor.rates.stepMultipliersTable = updatedStepMultipliersTable;
      vendor.rates.pricelistTable = updatedPricelistTable;
      await Vendors.updateOne({ _id: vendorId }, { rates: vendor.rates });
      break;
    case tableKeys.industryMultipliersTable:
      const { multiplier: industryMultiplier } = industryMultipliersTable.find(item => item._id.toString() === updatedItem._id.toString());
      if (industryMultiplier === Number(updatedItem.multiplier)) return;
      const updatedIndustryMultipliersTable = replaceOldItem(
        industryMultipliersTable,
        updatedItem,
        defaultPricelist,
        tableKeys.industryMultipliersTable,
        'Vendor'
      );
      updatedPricelistTable = changePricelistTable(
        basicPricesTable,
        stepMultipliersTable,
        industryMultipliersTable,
        pricelistTable,
        updatedItem,
        itemIdentifier
      );
      vendor.rates.industryMultipliersTable = updatedIndustryMultipliersTable;
      vendor.rates.pricelistTable = updatedPricelistTable;
      await Vendors.updateOne({ _id: vendorId }, { rates: vendor.rates });
      break;
  }
};

module.exports = {
  updateVendorRatesFromCompetence,
  updateVendorsRatePrices
};
