const { Pricelist, Step, Units, Vendors, Industries } = require('../models');
const { getFilteredBasicPrices  } = require('./basicPrice');
const { getFilteredStepMultiplier } = require('./stepMultipiers');
 
const getPricelistCombinations = async (priceListId, filters) => {
  const basicPricesTable = await getFilteredBasicPrices(filters, priceListId);
  const stepMultipliersTable = await getFilteredStepMultiplier(filters, priceListId);
  const { industryMultipliersTable } = await Pricelist.findOne({ _id: priceListId });
  const combinations = [];
  stepMultipliersTable.forEach(({ step, unit }) => {
    basicPricesTable.forEach(({ sourceLanguage, targetLanguage }) => {
      industryMultipliersTable.forEach(({ industry }) => {
        combinations.push(
          `${sourceLanguage} > ${targetLanguage} > ${step} > ${unit} > ${industry}`
        )
      })
    })
  })
  const uniqueCombos = Array.from(new Set(combinations));
  const priceListCombinations = [];
  for (let uniqueItem of uniqueCombos) {
    const splicedString = uniqueItem.split(' > ');
    priceListCombinations.push({
      sourceLanguage: splicedString[0],
      targetLanguage: splicedString[1],
      step: splicedString[2],
      unit: splicedString[3],
      industry: splicedString[4],
    })
  }
  return priceListCombinations;
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
