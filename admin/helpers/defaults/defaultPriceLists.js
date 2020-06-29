const { Vendors, Languages, Units, Industries } = require('../../models');
const ObjectId = require('mongodb').ObjectID;
const { Convert } = require('easy-currencies');

const getDefaultBasicPrices = async () => {
  const vendors = await Vendors.find({ languagePairs: { $gt: [] } });
  const duoLanguagesInUse = [];
  for (let { languagePairs } of vendors) {
    for (let pair of languagePairs) {
      const { lang } = await Languages.findOne({ _id: pair.source });
      const { lang: targetLang } = await Languages.findOne({ _id: pair.target });
      duoLanguagesInUse.push(`${lang} > ${targetLang}`);
    }
  }
  const uniqueDuoLangs = Array.from(new Set(duoLanguagesInUse));
  const defaultBasicPrices = [];
  const usd = await Convert(1).from('EUR').to('USD');
  const pound = await Convert(1).from('EUR').to('GBP');
  for (let uniquePair of uniqueDuoLangs) {
    const splicedString = uniquePair.split(' > ');
    const type = splicedString[0] === splicedString[1] ? 'Mono' : 'Duo';
    const sourceLang = await Languages.findOne({ lang: splicedString[0] });
    const targetLang = await Languages.findOne({ lang: splicedString[1] });
    defaultBasicPrices.push({
      type,
      sourceLanguage: sourceLang._id,
      targetLanguage: targetLang._id,
      euroBasicPrice: 1,
      usdBasicPrice: usd.toFixed(2),
      gbpBasicPrice: pound.toFixed(2)
    })
  }
  return defaultBasicPrices;
};

const getDefaultStepMultipliers = async () => {
  const units = await Units.find({ active: true });
  const defaultStepMultipliers = [];
  const usd = await Convert(1).from('EUR').to('USD');
  const pound = await Convert(1).from('EUR').to('GBP');
  for (let { _id, sizes, steps } of units) {
    if (sizes.length) {
      sizes.forEach(size => {
        steps.forEach(step => {
          defaultStepMultipliers.push({
            step: ObjectId(step._id),
            unit: _id,
            size: +size,
            euroMinPrice: 1,
            usdMinPrice: usd.toFixed(2),
            gbpMinPrice: pound.toFixed(2)
          })
        })
      })
    } else {
      steps.forEach(step => defaultStepMultipliers.push({
        step: step._id,
        unit: _id,
        size: 1,
        euroMinPrice: 1,
        usdMinPrice: usd.toFixed(2),
        gbpMinPrice: pound.toFixed(2)
      }))
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
    })
  }
  return defaultIndustryMultipliers;
};



module.exports = { getDefaultBasicPrices, getDefaultStepMultipliers, getDefaultIndustryMultipliers }
