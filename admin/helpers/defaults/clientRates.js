const { Clients, Pricelist } = require('../../models');
const ObjectId = require('mongodb').ObjectID;

// const getClientPricelistCombinations = ({ sourceLanguage, targetLanguage, basicPrice }, stepMultipliers, industries) => {
//   const pricelistCombinations = [];
//   stepMultipliers.forEach(({ step, unit, size }) => {
//     industries.forEach(({ _id }) => {
//       pricelistCombinations.push({
//         sourceLanguage: ObjectId(sourceLanguage),
//         targetLanguage: ObjectId(targetLanguage),
//         step: ObjectId(step._id),
//         unit: ObjectId(unit._id),
//         size,
//         industry: ObjectId(_id),
//         basicPrice,
//         minBasicPrice: basicPrice
//       });
//     });
//   });
//   return pricelistCombinations;
// };

const fillClientRates = async () => {
  const clients = await Clients.find({ services: { $ne: [] } })
    .populate('services.sourceLanguage')
    .populate('services.targetLanguage')
    .populate('services.service')
    .populate('services.industry');
  const { stepMultipliersTable } = await Pricelist.findOne()
    .populate('stepMultipliersTable.step')
    .populate('stepMultipliersTable.unit');
  for (let { _id, services } of clients) {
    const sourceLanguage = services[0].sourceLanguage._id;
    const targetLanguage = services[0].targetLanguage._id;
    const industryMultipliersTable = [];
    const industries = [];
    for (let { industry } of services) {
      if (industry !== null) {
        industries.push(industry);
      }
    }
    for (let { _id } of industries) {
      industryMultipliersTable.push({
        industry: _id,
      });
    }
    const basicPricesTable = {
      type: 'Duo',
      sourceLanguage,
      targetLanguage,
      euroBasicPrice: 1
    };
    await Clients.updateOne({ _id },
      {
        rates: {
          basicPricesTable: [basicPricesTable],
          stepMultipliersTable,
          industryMultipliersTable,
        },
      }
    );
  }
};


module.exports = { fillClientRates };
