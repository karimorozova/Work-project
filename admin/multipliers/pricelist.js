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
  const currencyRatio = await CurrencyRatio.find();
  const { USD, GBP } = currencyRatio[0];
  let updatedStepMultipliersTable = [];
  switch (key) {
    default:
    case 'Step':
      const updatedStep = await Step.findOne({ _id: oldMultiplier._id });
      const { difference, differentItem } = checkDifference(oldMultiplier.calculationUnit, updatedStep.calculationUnit);
      if (difference === 'Added') {
        const newMultiplierCombinations = [];
        const { sizes, _id: unitId } = differentItem;
        if (sizes.length) {
          sizes.forEach(size => {
            newMultiplierCombinations.push({
              euroMinPrice: 1,
              usdMinPrice: USD,
              gbpMinPrice: GBP,
              step: oldMultiplier._id,
              unit: unitId,
              size,
            });
          });
        } else {
          newMultiplierCombinations.push({
            euroMinPrice: 1,
            usdMinPrice: USD,
            gbpMinPrice: GBP,
            step: oldMultiplier._id,
            unit: unitId,
            size: 1
          });
        }
        for (let { _id, stepMultipliersTable } of pricelists) {
          await Pricelist.updateOne({ _id }, { stepMultipliersTable: [...stepMultipliersTable, ...newMultiplierCombinations] });
        }
      }
       if (difference === 'Deleted') {
        for (let { _id, stepMultipliersTable } of pricelists) {
          for (let deletedItem of differentItem) {
            stepMultipliersTable =  stepMultipliersTable.filter(item => `${item.step} ${item.unit}` !== `${item.step} ${deletedItem._id}`);
          }
          await Pricelist.updateOne({ _id }, { stepMultipliersTable });
        }
      }

      if (difference === 'Changed') {
        if (differentItem.deletedItems.length) {
          for (let { _id, stepMultipliersTable } of pricelists) {
            for (let item of stepMultipliersTable) {
              for (let deletedItem of differentItem.deletedItems) {


                // if (item.unit !== deletedItem._id && item.step === oldMultiplier) {
                //   console.log(item);
                //   console.log('--------------------------------------------');
                //   updatedStepMultipliersTable.push(item);
                // }

              }
              for (let changedItem of differentItem.newItems) {
                if (changedItem.steps.length > 1) {
                  for (let unit of changedItem.steps) {
                    updatedStepMultipliersTable.push({
                      euroMinPrice: 1,
                      usdMinPrice: USD,
                      gbpMinPrice: GBP,
                      step: changedItem._id,
                      unit: unit._id
                    })
                  }
                } else {
                  updatedStepMultipliersTable.push({
                    euroMinPrice: 1,
                    usdMinPrice: USD,
                    gbpMinPrice: GBP,
                    step: changedItem._id,
                    unit: changedItem.steps[0]._id
                  });
                }
              }
            }
            await Pricelist.updateOne({ _id }, { stepMultipliersTable: updatedStepMultipliersTable });
          }
        }
      }
  }
};

const checkDifference = (oldCondition, newCondition) => {
  if (oldCondition.length === newCondition.length) {
    const differentItem = arrayComparer(newCondition, oldCondition);
    if (differentItem) {
      const deletedItems = arrayComparer(oldCondition, newCondition);
      return { difference: 'Changed', differentItem: { newItems: differentItem, deletedItems } };
    } else {
      return { difference: 'No differences' };
    }
  } else if (oldCondition.length < newCondition.length) {
    return { difference: 'Added', differentItem: newCondition[newCondition.length - 1] };
  } else if (oldCondition.length > newCondition.length) {
    const differentItems = arrayComparer(oldCondition, newCondition);
    return { difference: 'Deleted', differentItem: differentItems};
  }
};

const arrayComparer = (oldCondition, newCondition) => oldCondition.filter(({ type: typeFromOld }) => (
  !newCondition.some(({ type: typeFromChanged }) => typeFromOld === typeFromChanged))
);


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
