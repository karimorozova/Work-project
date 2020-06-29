const { Pricelist, Languages } = require('../models');

const getFilteredBasicPrice = async (filteredBasicPrices, filters, needToSplice) => {
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
  return needToSplice ? filteredBasicPrices.splice(countFilter, 25) : filteredBasicPrices;
}
const getFilteredBasicPrices = async (filters, priceListId, needToSplice = true) => {
  try {
    const { basicPricesTable } = await Pricelist.findOne({ _id: priceListId }, { _id: 0, basicPricesTable: 1 })
      .populate('basicPricesTable.sourceLanguage').populate('basicPricesTable.targetLanguage');
    return await getFilteredBasicPrice(basicPricesTable, filters, needToSplice);
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

    await basicPricesTable.splice(basicPriceIndex, 1, basicPriceToUpdate)

    await Pricelist.updateOne({ _id: priceListId }, {basicPricesTable});
  } catch (err) {
    console.log(err);
    console.log('Error in updateBasicPrices');
  }
}

const updateBasicPriceValue = async ({ USD, GBP }) => {
  try {
    const pricelists = await Pricelist.find();
    for (let { basicPricesTable, _id } of pricelists) {
      let updatedBasicPrices = [];
      for (let {
        euroBasicPrice,
        usdBasicPrice,
        gbpBasicPrice,
        _id: basicPriceId,
        type,
        sourceLanguage,
        targetLanguage } of basicPricesTable ) {
        usdBasicPrice *= Number(USD);
        gbpBasicPrice *= Number(GBP);
        updatedBasicPrices.push({
          euroBasicPrice,
          usdBasicPrice,
          gbpBasicPrice,
          _id: basicPriceId,
          type,
          sourceLanguage,
          targetLanguage
        })
      }
      await Pricelist.updateOne({ _id }, { basicPricesTable: updatedBasicPrices });
    }
  } catch (err) {
    console.log(err);
    console.log('Error in updateBasicPriceValue');
  }
}

module.exports = { getFilteredBasicPrices, updateBasicPrices, updateBasicPriceValue };
