const { Pricelist, Step, Units, Vendors, Languages, Industries, CurrencyRatio } = require('../models');
const { getFilteredBasicPrices  } = require('./basicPrice');
const { getFilteredStepMultiplier } = require('./stepMultipiers');
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
        })
      })
    })
  });
  const groupedPriceLists = groupPriceList(priceListCombinations);
  console.log(groupedPriceLists);
  return priceListCombinations.splice(countFilter, 25);
};

const groupPriceList = (arr) => {
  const groupedCombos = [];
  arr.reduce((acc, curr) => {
    const pattern = {
      sourceLanguage: acc.sourceLanguage.lang,
      targetLanguage: acc.targetLanguage.lang,
      step: acc.step.title,
      unit: acc.unit.type,
      industry: 'All',
      eurPrice: acc.eurPrice,
      euroMinPrice: acc.euroMinPrice,
      usdPrice: acc.usdPrice,
      usdMinPrice: acc.usdMinPrice,
      gbpPrice: acc.gbpPrice,
      gbpMinPrice: acc.gbpMinPrice,
    };
    if (pattern.eurPrice === curr.eurPrice &&
      pattern.euroMinPrice === curr.euroMinPrice &&
      pattern.usdPrice === curr.usdPrice &&
      pattern.usdMinPrice === curr.usdMinPrice &&
      pattern.gbpPrice === curr.gbpPrice &&
      pattern.gbpMinPrice === curr.gbpMinPrice) {
      groupedCombos.push(pattern)
    } else {
      const exceptionsArr = [];
      exceptionsArr.push([...exceptionsArr, curr.industry]);
      groupedCombos.push({ ...pattern, industry: `All Except (${[...exceptionsArr]})` })
    }
     return acc;
  });
  return groupedCombos;
}

const addNewMultiplier = async (key, newMultiplierId) => {
  try {
    const pricelists = await Pricelist.find();
    const currencyRatio = await CurrencyRatio.find()[0];
    let newMultiplier;
    let newMultiplierCombinations = [];
    switch (key) {
      default:
      case 'Step':
        newMultiplier = await Step.findOne({ _id: newMultiplierId });
        newMultiplierCombinations = await getMultiplierCombinations(newMultiplier, 'Step', currencyRatio);
        for (let { _id, stepMultipliersTable } of pricelists) {
          await Pricelist.updateOne({ _id }, { stepMultipliersTable: [...stepMultipliersTable, ...newMultiplierCombinations] })
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
        newMultiplier = await Languages.findOne({ _id: newMultiplierId })
    }
  } catch (err) {
    console.log(err);
    console.log('Error in addNewMultiplier');
  }
}

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
            })
          })
        } else {
          combinations.push({
            euroMinPrice: 1,
            usdMinPrice: USD,
            gbpMinPrice: GBP,
            step: _id,
            unit: unitId,
            size: 1
          })
        }
      }
    }
  }
  return combinations
}

module.exports = { getPricelistCombinations, addNewMultiplier }
