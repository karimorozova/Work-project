const { Vendors, Languages, Units, Industries } = require('../../models');
const ObjectId = require('mongodb').ObjectID;

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
  for (let uniquePair of uniqueDuoLangs) {
    const splicedString = uniquePair.split(' > ');
    const type = splicedString[0] === splicedString[1] ? 'Mono' : 'Duo';
    const sourceLang = await Languages.findOne({ lang: splicedString[0] });
    const targetLang = await Languages.findOne({ lang: splicedString[1] });
    defaultBasicPrices.push({
      type,
      sourceLanguage: sourceLang._id,
      targetLanguage: targetLang._id,
    })
  }
  return defaultBasicPrices;
};

const getDefaultStepMultipliers = async () => {
  const units = await Units.find({ active: true });
  const defaultStepMultipliers = [];
  for (let { _id, sizes, steps } of units) {
    if (sizes.length) {
      sizes.forEach(size => {
        steps.forEach(step => {
          defaultStepMultipliers.push({
            step: ObjectId(step._id),
            unit: _id,
            size: +size,
          })
        })
      })
    } else {
      steps.forEach(step => defaultStepMultipliers.push({
        step: step._id,
        unit: _id,
        size: 1
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
const getDefaultPriceLists = async () => {
  const defaultBasicPrices = await getDefaultBasicPrices();
  const defaultStepMultipliers = await getDefaultStepMultipliers();
  const defaultIndustryMultipliers = await getDefaultIndustryMultipliers();
  const combinations = [];
  defaultStepMultipliers.forEach(({ step, unit }) => {
    defaultBasicPrices.forEach(({ sourceLanguage, targetLanguage }) => {
      defaultIndustryMultipliers.forEach(({ industry }) => {
        combinations.push(
          `${sourceLanguage} > ${targetLanguage} > ${step} > ${unit} > ${industry}`
        )
      })
    })
  })
  const uniqueCombos = Array.from(new Set(combinations));
  const defaultPriceLists = [];
  for (let uniqueItem of uniqueCombos) {
    const splicedString = uniqueItem.split(' > ');
    defaultPriceLists.push({
      sourceLanguage: ObjectId(splicedString[0]),
      targetLanguage: ObjectId(splicedString[1]),
      step: ObjectId(splicedString[2]),
      unit: ObjectId(splicedString[3]),
      industry: ObjectId(splicedString[4]),
    })
  }
  return {
    defaultBasicPrices,
    defaultStepMultipliers,
    defaultIndustryMultipliers,
    defaultPriceLists
  }
};



module.exports = { getDefaultBasicPrices, getDefaultStepMultipliers, getDefaultIndustryMultipliers, getDefaultPriceLists }
