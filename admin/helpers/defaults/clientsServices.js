const { Clients, Languages, Services } = require('../../models');
const ObjectId = require('mongodb').ObjectID;

const fillClientServices = async () => {
  const clients = await Clients.find();
  const englishLang = await Languages.findOne({ lang: 'English' });
  const translationService = await Services.findOne({ title: 'Translation' });
  for (let { _id, industries } of clients) {
    const services = []
    for (let industry of industries) {
      services.push({
        sourceLanguage: ObjectId(englishLang._id),
        targetLanguage: ObjectId(englishLang._id),
        service: ObjectId(translationService._id),
        industry: ObjectId(industry)
      })
    }
    await Clients.updateOne({ _id }, { services })
  }
}

module.exports = { fillClientServices };
