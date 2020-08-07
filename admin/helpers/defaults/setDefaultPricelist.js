const { Clients, Pricelist } = require('../../models');

const setDefaultPricelist = async () => {
  const pricelists = await Pricelist.find();
  const clients = await Clients.find();
  const firstPricelist = pricelists[0];
  for (let { _id, defaultPricelist } of clients) {
    defaultPricelist = firstPricelist._id;
    await Clients.updateOne({ _id }, { defaultPricelist });
  }
};

module.exports = { setDefaultPricelist }
