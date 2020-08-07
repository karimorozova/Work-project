const { Pricelist, Clients } = require('../../models');

const setDefaultPricelist = async () => {
  const allPricelists = await Pricelist.find();
  const clients = await Clients.find();
  const firstPricelist = allPricelists[0];
  for (let { _id, defaultPricelist } of clients) {
    defaultPricelist = firstPricelist._id;
    await Clients.updateOne({ _id }, { defaultPricelist });
  }
};


module.exports = { setDefaultPricelist }
