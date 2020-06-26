const { Pricelist, Step, Units, Vendors, Industries } = require('../models');
const { getFilteredBasicPrices  } = require('./basicPrice');
const { getFilteredStepMultiplier } = require('./stepMultipiers');

const getPricelistCombinations = async (priceListId, filters) => {
  const { countFilter } = filters;
  const basicPricesTable = await getFilteredBasicPrices(filters, priceListId);
  const stepMultipliersTable = await getFilteredStepMultiplier(filters, priceListId);
  const industries = await Industries.find();
  const priceListCombinations = [];
  stepMultipliersTable.forEach(({ step, unit }) => {
    basicPricesTable.forEach(({ sourceLanguage, targetLanguage }) => {
      industries.forEach(industry => {
        priceListCombinations.push({
          sourceLanguage,
          targetLanguage,
          step,
          unit,
          industry,
        })
      })
    })
  })
  return priceListCombinations.splice(countFilter, 25);
};

const addNewMultiplier = async (key, newMultiplierId) => {
  try {
    const pricelists = await Pricelist.find();
    let newMultiplier;
    let newMultiplierCombinations = [];
    switch (key) {
      default:
      case 'Step':
        newMultiplier = await Step.findOne({ _id: newMultiplierId });
        newMultiplierCombinations = await getMultiplierCombinations(newMultiplier, 'Step');
        break;
      case 'Unit':
        newMultiplier = await Units.findOne({ _id: newMultiplierId });
        newMultiplierCombinations = await getMultiplierCombinations(newMultiplier, 'Unit');
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
      // case 'LanguagePair':
    }

  } catch (err) {
    console.log(err);
    console.log('Error in addNewMultiplier');
  }
}

const getMultiplierCombinations = async (newMultiplier, key) => {
  let combinations = [];
  if (key === 'Step') {
    const {  } = newMultiplier;
  }
}

module.exports = { getPricelistCombinations, addNewMultiplier }
