const { Vendors, Clients, Languages, Units, Industries, CurrencyRatio } = require('../../models');
const ObjectId = require('mongodb').ObjectID;

const getDefaultBasicPrices = async () => {
  const vendors = await Vendors.find({ competencies: { $gt: [] } });
  const clients = await Clients.find({ sourceLanguages: { $gt: [] }, targetLanguages: { $gt: [] } });
  const currencyRatio = await CurrencyRatio.find();
  const { USD, GBP } = currencyRatio[0];
  const uniqueDuoLangs = await getUniqueLangPairs(vendors, clients);
  const defaultBasicPrices = [];
  let sourcesArr = [];
  let targetsArr = [];

  for (let uniquePair of uniqueDuoLangs) {
    const splicedString = uniquePair.split(' > ');
    sourcesArr.push(splicedString[0]);
    targetsArr.push(splicedString[1]);
  }

  const allLanguages = await Languages.find({});
  let originallySources = [...new Set(sourcesArr)].map(item => allLanguages.find(i => i.lang === item));
  let originallyTargets = [...new Set(targetsArr)].map(item => allLanguages.find(i => i.lang === item));

  originallySources.forEach(source => {
    return originallyTargets.forEach(target => {
      return defaultBasicPrices.push({
        type: source.lang === target.lang ? 'Mono' : 'Duo',
        sourceLanguage: source._id,
        targetLanguage: target._id,
        euroBasicPrice: 1,
        usdBasicPrice: USD,
        gbpBasicPrice: GBP
      });
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

const getUniqueLangPairs = async (vendors, clients) => {
  let langPairs = [];
  for (let { competencies } of vendors) {
    for (let { sourceLanguage, targetLanguage } of competencies) {
      const { lang } = await Languages.findOne({ _id: sourceLanguage });
      const { lang: targetLang } = await Languages.findOne({ _id: targetLanguage });
      langPairs.push(`${lang} > ${targetLang}`);
    }
  }
  for (let { sourceLanguages, targetLanguages } of clients) {
    for (const source of sourceLanguages) {
      for (const target of targetLanguages) {
        const { lang } = await Languages.findOne({ _id: source });
        const { lang: targetLang } = await Languages.findOne({ _id: target });
        langPairs.push(`${lang} > ${targetLang}`);
      }
    }
  }
  return Array.from(new Set(langPairs));
};


module.exports = { getDefaultBasicPrices, getDefaultStepMultipliers, getDefaultIndustryMultipliers };
