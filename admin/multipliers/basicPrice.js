const { Pricelist, Languages } = require('../models');

const getFilteredBasicPrice = async (filteredBasicPrices, filters) => {
  const { countFilter } = filters;
  if (filters.sourceFilter) {
    const lang = await Languages.findOne({ lang: filters.sourceFilter });
    filteredBasicPrices = filteredBasicPrices.filter(({ sourceLanguage }) => sourceLanguage._id.toString() === lang._id.toString())
  }
  if (filters.targetFilter) {
    const lang = await Languages.findOne({ lang: filters.targetFilter });
    filteredBasicPrices = filteredBasicPrices.filter(({ targetLanguage }) => (
      targetLanguage._id.toString() === lang._id.toString()
    ))
  }
  if (filters.typeFilter) {
    filteredBasicPrices = filteredBasicPrices.filter(({ type }) => type === filters.typeFilter);
  }
  return filteredBasicPrices.splice(countFilter, 25);
}
const getFilteredBasicPrices = async (filters, priceListId) => {
  try {
    const { basicPricesTable } = await Pricelist.findOne({ _id: priceListId }, { _id: 0, basicPricesTable: 1 })
      .populate('basicPricesTable.sourceLanguage').populate('basicPricesTable.targetLanguage');
    return await getFilteredBasicPrice(basicPricesTable, filters);
  } catch (err) {
    console.log(err);
    console.log('Error in getFilteredBasicPrices');
    throw new Error(err.message);
  }
};

const updateBasicPrices = async (basicPriceToUpdate, priceListId) => {
  try {
    const { basicPricesTable } = await Pricelist.findOne({ _id: priceListId }, { _id: 0, basicPricesTable: 1 });
    const basicPriceIndex = basicPricesTable.findIndex(basicPrice => (
      basicPrice._id.toString() === basicPriceToUpdate._id
    ));
    basicPricesTable.splice(basicPriceIndex, 1, {
      type: basicPricesTable[basicPriceIndex].type,
      sourceLanguage: basicPricesTable[basicPriceIndex].sourceLanguage,
      targetLanguage: basicPricesTable[basicPriceIndex].targetLanguage,
      euroBasicPrice: basicPriceToUpdate.euroBasicPrice,
      usdBasicPrice: basicPriceToUpdate.usdBasicPrice,
      gbpBasicPrice: basicPriceToUpdate.gbpBasicPrice
    });
    // await Pricelist.updateOne({ _id: priceListId }, basicPricesTable);
  } catch (err) {
    console.log(err);
    console.log('Error in updateBasicPrices');
  }
}

module.exports = { getFilteredBasicPrices, updateBasicPrices };
