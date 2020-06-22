const { Vendors, Clients, BasicPrice, CurrencyRatio, Languages } = require('../../models');

const getLanguagesRatio = async () => {
  const currencyRatio = await CurrencyRatio.findOne();
  const vendors = await Vendors.find({ languagePairs: { $gt: [] } });
  // const clients = await Clients.find({ languagePairs: { $gt: [] } });
  const monoLanguagesInUse = [];
  const duoLanguagesInUse = [];
  for (let { languagePairs } of vendors) {
    for (let pair of languagePairs) {
      const { lang } = await Languages.findOne({ _id: pair.source });
      const { lang: targetLang } = await Languages.findOne({ _id: pair.target });
      monoLanguagesInUse.push(targetLang);
      duoLanguagesInUse.push(lang, targetLang);
    }
  }
  const uniqueMonoLangs = Array.from(new Set(monoLanguagesInUse));
  const uniqueDuoLangs = Array.from(new Set(duoLanguagesInUse));
}

module.exports = { getLanguagesRatio }
