const { Languages, Units, Industries, CurrencyRatio } = require('../../models');
const ObjectId = require('mongodb').ObjectID;

const getDefaultBasicPrices = async () => {
  const currencyRatio = await CurrencyRatio.find();
  const { USD, GBP } = currencyRatio[0];
  const defaultBasicPrices = [];
  const allLanguages = await Languages.find({});
  const EnglishBritain = allLanguages.find(({ lang }) => lang === 'English (United Kingdom)');
  allLanguages.forEach(language => {
    return defaultBasicPrices.push({
      type: language.lang === EnglishBritain.lang ? 'Mono' : 'Duo',
      sourceLanguage: EnglishBritain._id,
      targetLanguage: language._id,
      euroBasicPrice: 1,
      usdBasicPrice: USD,
      gbpBasicPrice: GBP
    });
  });
  return defaultBasicPrices;
};

const getDefaultStepMultipliers = async () => {
  const units = await Units.find({ active: true });
  const currencyRatio = await CurrencyRatio.find();
  const { USD, GBP } = currencyRatio[0];
  const defaultStepMultipliers = [];
  for (let { _id, sizes, steps } of units) {
    if (sizes.length) {
      sizes.forEach(size => {
        steps.forEach(step => {
          defaultStepMultipliers.push({
            step: ObjectId(step._id),
            unit: _id,
            size: +size,
            euroMinPrice: 1,
            usdMinPrice: USD,
            gbpMinPrice: GBP
          });
        });
      });
    } else {
      steps.forEach(step => defaultStepMultipliers.push({
        step: step._id,
        unit: _id,
        size: 1,
        euroMinPrice: 1,
        usdMinPrice: USD,
        gbpMinPrice: GBP
      }));
    }
  }
  return defaultStepMultipliers;
};
const getDefaultIndustryMultipliers = async () => {
  const industries = await Industries.find({ active: true });
  const defaultIndustryMultipliers = [];
  for (let { _id } of industries) {
    defaultIndustryMultipliers.push({
      industry: _id,
    });
  }
  return defaultIndustryMultipliers;
};



module.exports = { getDefaultBasicPrices, getDefaultStepMultipliers, getDefaultIndustryMultipliers };
