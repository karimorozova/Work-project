const { BasicPrice } = require('../models');

const getFilteredBasicPriceQuery = async (filters) => {
  let query = {};
  if (filters.sourceFilter) {
    query.sourceLanguage = { _id: filters.sourceFilter };
  }
  if (filters.targetFilter) {
    query.targetLanguage = { _id: filters.targetFilter };
  }
  if (filters.typeFilter) {
    query.type = { type: filters.typeFilter };
  }
  return query;
}
const getFilteredBasicPrices = async (filters) => {
  const { countFilter } = filters;
  try {
    const query = await getFilteredBasicPriceQuery(filters);
    const basicPrices = await BasicPrice.find(query).skip(countFilter).limit(25);
    return BasicPrice.populate(basicPrices, [
      'sourceLanguage',
      'targetLanguage'
    ])
  } catch (err) {
    console.log(err);
    console.log('Error in getFilteredBasicPrices');
    throw new Error(err.message);
  }
};

module.exports = { getFilteredBasicPrices };
