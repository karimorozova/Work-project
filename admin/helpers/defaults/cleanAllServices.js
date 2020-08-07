const { Clients } = require('../../models');

const cleanAllServices = async () => {
  const clients = await Clients.find();
  for (let { _id, services, rates } of clients) {
    services = [];
    rates = {
      basicPricesTable: [],
      stepMultipliersTable: [],
      industryMultipliersTable: [],
      pricelistTable: []
    }
    await Clients.updateOne({ _id }, { services, rates });
  }
}

module.exports = { cleanAllServices }
