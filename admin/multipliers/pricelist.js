const { Pricelist, Step, Units, Vendors, Languages, Industries, CurrencyRatio } = require('../models');
const { getFilteredBasicPrices } = require('./basicPrice');
const { getFilteredStepMultiplier } = require('./stepMultipiers');
const lodash = require('lodash');
const getPercentage = (number, percentage) => (number / 100) * percentage;

const getPricelistCombinations = async (priceListId, filters) => {
  const { countFilter, industryFilter } = filters;
  const basicPricesTable = await getFilteredBasicPrices(filters, priceListId, false);
  const stepMultipliersTable = await getFilteredStepMultiplier(filters, priceListId, false);
  const { industryMultipliersTable } = await Pricelist.findOne({ _id: priceListId }, { industryMultipliersTable: 1 }).populate('industryMultipliersTable.industry');
  const industryMultipliers = industryFilter ? industryMultipliersTable.filter(({ industry }) => industry.name === industryFilter) : industryMultipliersTable;
  const priceListCombinations = [];
  stepMultipliersTable.forEach(({ step, unit, multiplier: stepMultiplierValue, euroMinPrice, usdMinPrice, gbpMinPrice }) => {
    basicPricesTable.forEach(({ sourceLanguage, targetLanguage, euroBasicPrice, usdBasicPrice, gbpBasicPrice }) => {
      industryMultipliers.forEach(({ industry, multiplier: industryMultiplierValue }) => {
        priceListCombinations.push({
          sourceLanguage,
          targetLanguage,
          step,
          unit,
          industry: industry.name,
          eurPrice: +(getPercentage(euroBasicPrice, stepMultiplierValue) + getPercentage(euroBasicPrice, industryMultiplierValue)).toFixed(2),
          euroMinPrice,
          usdPrice: +(getPercentage(usdBasicPrice, stepMultiplierValue) + getPercentage(usdBasicPrice, industryMultiplierValue)).toFixed(2),
          usdMinPrice,
          gbpPrice: +(getPercentage(gbpBasicPrice, stepMultiplierValue) + getPercentage(gbpBasicPrice, industryMultiplierValue)).toFixed(2),
          gbpMinPrice
        });
      });
    });
  });

  // const groupedPriceLists = groupPriceList(priceListCombinations);
  // console.log(groupedPriceLists);

  return priceListCombinations.splice(countFilter, 25);
};

const groupPriceList = (arr) => {

  // source = lodash.groupBy(arr, function(item) {
  //   return item.sourceLanguage.lang;
  // });
  // lodash.forEach(source, function(value, key) {
  //   source[key] = lodash.groupBy(source[key], function(item) {
  //     return item.targetLanguage.lang;
  //   });
  // });

  // console.log(source['English'].Arabic);
  // // console.log(Object.keys(source));
  // console.log(Object.values(source));

  // arr.reduce((acc, curr) => {

  // const pattern = {
  //   sourceLanguage: acc.sourceLanguage.lang,
  //   targetLanguage: acc.targetLanguage.lang,
  //   step: acc.step.title,
  //   unit: acc.unit.type,
  //   // industry: 'All',
  //   eurPrice: acc.eurPrice,
  //   euroMinPrice: acc.euroMinPrice,
  //   usdPrice: acc.usdPrice,
  //   usdMinPrice: acc.usdMinPrice,
  //   gbpPrice: acc.gbpPrice,
  //   gbpMinPrice: acc.gbpMinPrice,
  // };
  // });

  // return groupedCombos;
};

const addNewMultiplier = async (key, newMultiplierId) => {
  try {
    const pricelists = await Pricelist.find();
    const currencyRatio = await CurrencyRatio.find();
    let newMultiplier;
    let newMultiplierCombinations = [];
    switch (key) {
      default:
      case 'Step':
        newMultiplier = await Step.findOne({ _id: newMultiplierId });
        newMultiplierCombinations = await getMultiplierCombinations(newMultiplier, 'Step', currencyRatio[0]);
        for (let { _id, stepMultipliersTable } of pricelists) {
          await Pricelist.updateOne({ _id }, { stepMultipliersTable: [...stepMultipliersTable, ...newMultiplierCombinations] });
        }
        break;
      case 'Unit':
        newMultiplier = await Units.findOne({ _id: newMultiplierId });
        newMultiplierCombinations = await getMultiplierCombinations(newMultiplier, 'Unit', currencyRatio[0]);
        for (let { _id, stepMultipliersTable } of pricelists) {
          await Pricelist.updateOne({ _id }, { stepMultipliersTable: [...stepMultipliersTable, ...newMultiplierCombinations] });
        }
        break;
      case 'Industry':
        newMultiplier = await Industries.findOne({ _id: newMultiplierId });
        for (let { _id, industryMultipliersTable } of pricelists) {
          industryMultipliersTable.push({
            industry: newMultiplier._id
          });
          await Pricelist.updateOne({ _id }, { industryMultipliersTable });
        }
        break;
      case 'LanguagePair':
        newMultiplier = await Languages.findOne({ _id: newMultiplierId });
    }
  } catch (err) {
    console.log(err);
    console.log('Error in addNewMultiplier');
  }
};

const updateMultiplier = async (key, oldMultiplier) => {
  const pricelists = await Pricelist.find();
  switch (key) {
    default:
    case 'Step':
      const oldStep = oldMultiplier;
      const updatedStep = await Step.findOne({ _id: oldStep._id });
      const { difference, itemsToReplace, itemsToDelete } =
        getDifference(oldStep.calculationUnit, updatedStep.calculationUnit);
      await checkDifference(difference, itemsToReplace, itemsToDelete, oldStep);
      break;
    case 'Unit':
      const oldUnit = oldMultiplier;
      const updatedUnit = await Units.findOne({ _id: oldUnit._id });
      const deletedSteps = arrayComparer(oldUnit.steps, updatedUnit.steps, 'title');
      const addedSteps = arrayComparer(updatedUnit.steps, oldUnit.steps, 'title');
      if (deletedSteps.length) {
        for (let { _id: stepId } of deletedSteps) {
            for (let { _id, stepMultipliersTable } of pricelists) {
              stepMultipliersTable = stepMultipliersTable.filter(item => `${item.step} ${item.unit}` !== `${stepId} ${oldUnit._id}`);
              await Pricelist.updateOne({ _id }, { stepMultipliersTable });
            }
        }
      }
      if (addedSteps.length) {
        for (let { _id } of addedSteps) {
          for (let oldStep of oldUnit.steps) {
            const neededStep = await Step.findOne({ _id });
            const { difference, itemsToReplace, itemsToDelete } =
              getDifference(oldStep.calculationUnit, neededStep.calculationUnit);
            // console.log('from added: ', difference);
            // console.log('====================================');
            // console.log(itemsToReplace);
            // console.log('====================================');
            // console.log(itemsToDelete);
            // console.log('====================================');
            // await checkDifference(difference, itemsToReplace, itemsToDelete, oldStep);
          }
        }
      }
  }
};

const getDifference = (oldCondition, newCondition) => {
  let itemsToReplace = arrayComparer(newCondition, oldCondition, 'type');
  let itemsToDelete = arrayComparer(oldCondition, newCondition, 'type');
  if (oldCondition.length > newCondition.length) {
    if (itemsToReplace.length) {
      return { difference: 'Deleted and replaced', itemsToReplace, itemsToDelete };
    } else {
      return { difference: 'Just deleted', itemsToDelete };
    }
  } else if (oldCondition.length === newCondition.length) {
    if (itemsToReplace.length) {
      return { difference: 'Just replaced', itemsToReplace, itemsToDelete };
    }
  } else if (newCondition.length > oldCondition.length) {
    if (itemsToReplace.length && itemsToDelete.length === 0) {
      return { difference: 'Just added', itemsToReplace };
    } else {
      return { difference: 'Added and replaced', itemsToReplace, itemsToDelete };
    }
  }
};

const arrayComparer = (oldCondition, newCondition, key) => oldCondition.filter(({ [key]: keyFromOld }) => (
  !newCondition.some(({ [key]: keyFromChanged }) => keyFromOld === keyFromChanged))
);

const checkDifference = async (difference, itemsToReplace, itemsToDelete, oldStep) => {
  const pricelists = await Pricelist.find();
  const currencyRatio = await CurrencyRatio.find();
  const { USD, GBP } = currencyRatio[0];
  switch (difference) {
    default:
    case 'Deleted and replaced' || 'Just replaced' || 'Added and replaced':
      for (let { _id, stepMultipliersTable } of pricelists) {
        for (let itemToReplace of itemsToReplace) {
          const { _id, sizes } = await Units.findOne({ _id: itemToReplace._id });
          if (sizes.length) {
            for (let i = 0; i < sizes.length; i += 1) {
              itemToReplace = {
                usdMinPrice: USD,
                gbpMinPrice: GBP,
                step: oldStep._id,
                unit: _id,
                size: sizes[i],
              };
              stepMultipliersTable.push(itemToReplace);
            }
          } else {
            itemToReplace = {
              usdMinPrice: USD,
              gbpMinPrice: GBP,
              step: oldStep._id,
              unit: _id,
              size: 1
            };
            stepMultipliersTable.push(itemToReplace);
          }
        }
        for (let itemToDelete of itemsToDelete) {
          stepMultipliersTable = stepMultipliersTable.filter(item => (
            `${item.step} ${item.unit}` !== `${oldStep._id} ${itemToDelete._id}`
          ));
        }
        await Pricelist.updateOne({ _id }, { stepMultipliersTable });
      }
      break;
    case 'Just deleted':
      for (let { _id, stepMultipliersTable } of pricelists) {
        for (let itemToDelete of itemsToDelete) {
          stepMultipliersTable = stepMultipliersTable.filter(item => (
            `${item.step} ${item.unit}` !== `${oldStep._id} ${itemToDelete._id}`
          ));
        }
        await Pricelist.updateOne({ _id }, { stepMultipliersTable });
      }
      break;
    case 'Just added':
      const newMultiplierCombinations = [];
      for (let itemToReplace of itemsToReplace) {
        const { sizes, _id: unitId } = itemToReplace;
        if (sizes.length) {
          sizes.forEach(size => {
            newMultiplierCombinations.push({
              euroMinPrice: 1,
              usdMinPrice: USD,
              gbpMinPrice: GBP,
              step: oldStep._id,
              unit: unitId,
              size,
            });
          });
        } else {
          newMultiplierCombinations.push({
            euroMinPrice: 1,
            usdMinPrice: USD,
            gbpMinPrice: GBP,
            step: oldStep._id,
            unit: unitId,
            size: 1
          });
        }
        for (let { _id, stepMultipliersTable } of pricelists) {
          await Pricelist.updateOne({ _id }, { stepMultipliersTable: [...stepMultipliersTable, ...newMultiplierCombinations] });
        }
      }
      break;
  }
};


const getMultiplierCombinations = async (newMultiplier, key, { USD, GBP }) => {
  let combinations = [];
  if (key === 'Step') {
    const { _id, calculationUnit } = newMultiplier;
    if (calculationUnit.length) {
      for (let { sizes, _id: unitId } of calculationUnit) {
        if (sizes.length) {
          sizes.forEach(size => {
            combinations.push({
              euroMinPrice: 1,
              usdMinPrice: USD,
              gbpMinPrice: GBP,
              step: _id,
              unit: unitId,
              size,
            });
          });
        } else {
          combinations.push({
            euroMinPrice: 1,
            usdMinPrice: USD,
            gbpMinPrice: GBP,
            step: _id,
            unit: unitId,
            size: 1
          });
        }
      }
    }
  }
  if (key === 'Unit') {
    const { _id, sizes, steps } = newMultiplier;
    if (sizes.length) {
      sizes.forEach(size => {
        steps.forEach(step => {
          combinations.push({
            euroMinPrice: 1,
            usdMinPrice: USD,
            gbpMinPrice: GBP,
            step: step._id,
            unit: _id,
            size,
          });
        });
      });
    } else {
      steps.forEach(step => {
        combinations.push({
          euroMinPrice: 1,
          usdMinPrice: USD,
          gbpMinPrice: GBP,
          step: step._id,
          unit: _id,
          size: 1
        });
      });
    }
  }
  return combinations;
};

module.exports = { getPricelistCombinations, addNewMultiplier, updateMultiplier };
