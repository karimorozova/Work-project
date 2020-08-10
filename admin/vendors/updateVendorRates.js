const { Vendors } = require('../models');
const { generateNewStepCombinations } = require('../clients/editClientRates');

const updateVendorRates = async (vendorId, newData, oldData) => {
  const vendor = await Vendors.findOne({ _id: vendorId });
  const sourceLangDifference = compareIds(newData.sourceLanguage, oldData.sourceLanguage);
  const targetLangDifference = compareIds(newData.targetLanguage, oldData.targetLanguage);
  const stepDifference = compareIds(newData.step, oldData.step);
  const industryDifference = compareIds(newData.industry, oldData.industry);
  if (sourceLangDifference.lang || targetLangDifference) {
    await updateVendorLangPairs(
      oldData.sourceLanguage._id,
      sourceLangDifference._id,
      targetLangDifference._id,
      vendor
    );
  }
  if (stepDifference) {
    await updateVendorStep(oldData.step._id, newData.step, vendor);
  }
  if (industryDifference) {
    await updateVendorIndustry(oldData.industry._id, newData.industry, vendor);
  }

  function compareIds(obj1, obj2) {
    return obj1._id.toString() !== obj2._id.toString() ? obj1 : undefined;
  }
};

const updateVendorLangPairs = async (oldSourceId, newSourceLangId, newTargetId, vendor) => {
  const { _id, rates } = vendor;
  let updatedRates = rates;
  let { basicPricesTable, pricelistTable } = updatedRates;
  if (newSourceLangId) {
    updatedRates.basicPricesTable = changeId(basicPricesTable, oldSourceId, newSourceLangId, 'sourceLanguage');
    updatedRates.pricelistTable = changeId(pricelistTable, oldSourceId, newSourceLangId, 'sourceLanguage');
  }
  if (newTargetId) {
    updatedRates.basicPricesTable = replaceByLangPair(basicPricesTable, oldSourceId, newTargetId);
    updatedRates.pricelistTable = replaceByLangPair(pricelistTable, oldSourceId, newTargetId);
  }

  await Vendors.updateOne({ _id }, { rates: updatedRates });

  function changeId(arr, idToSearch, idForReplace, key) {
    return arr.map(item => {
      if (item[key].toString() === idToSearch.toString()) {
        item[key] = idForReplace;
      }
      return item;
    });
  }

  function replaceByLangPair(arr, sourceLangId, targetLangId) {
    return arr.map(item => {
      if (`${item.sourceLanguage} ${item.targetLanguage}` === `${sourceLangId} ${targetLangId}`) {
        item.targetLanguage = targetLangId;
      }
      return item;
    });
  }
};

const updateVendorStep = async (oldStepId, newStep, vendor) => {
  const { _id, rates } = vendor;
  let updatedRates = rates;
  updatedRates = deleteRedundantSteps(updatedRates, newStep._id, oldStepId);
  updatedRates = pushNewStepCombinations(updatedRates, newStep);
  const duplicatesArr = checkForDuplicates(updatedRates.stepMultipliersTable, newStep._id, oldStepId);
  if (duplicatesArr.length) {
    await Vendors.updateOne({ _id }, { rates });
  }

  await Vendors.updateOne({ _id }, { rates: updatedRates });

  function deleteRedundantSteps(rates, oldStepId) {
    return {
      ...rates,
      stepMultipliersTable: rates.stepMultipliersTable.filter(item => item.step.toString() !== oldStepId.toString()),
      pricelistTable: rates.pricelistTable.filter(item => item.step.toString() !== oldStepId.toString()),
    };
  }

  function pushNewStepCombinations(rates, newStep) {
    const { basicPricesTable, stepMultipliersTable, industryMultipliersTable, pricelistTable } = rates;
    const { calculationUnit } = newStep;
    if (!calculationUnit.length) return rates;
    for (let { _id: unitId, sizes } of calculationUnit) {
      if (sizes.length) {
        sizes.forEach(size => {
          stepMultipliersTable.push({
            step: newStep._id,
            unit: unitId,
            size
          });
        });
      } else {
        stepMultipliersTable.push({
          step: newStep._id,
          unit: unitId,
          size: 1
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

const updateVendorIndustry = async (oldIndustryId, newIndustry, vendor) => {
  const { _id, rates } = vendor;
  let updatedRates = rates;
  const duplicatesArr = checkForDuplicates(updatedRates.industryMultipliersTable, newIndustry._id, oldIndustryId);
  if (duplicatesArr.length) {
    await Vendors.updateOne({ _id }, { rates });
  }
  updatedRates = deleteRedundantIndustries(updatedRates, oldIndustryId);

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
};

  function pushNewIndustries

const checkForDuplicates = (arr, newItemId, oldItemId, key) => {
  const itemsForCheck = arr
    .filter(item => item[key].toString() !== oldItemId.toString())
    .map(item => item[key]);
  return itemsForCheck.find(id => id === newItemId);
};
module.exports = {
  updateVendorRates
};
