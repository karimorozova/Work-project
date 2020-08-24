const { Pricelist, Clients } = require('../../models');
const ObjectId = require('mongodb').ObjectID;

const setDefaultPricelist = async () => {
  const clients = await Clients.find();
  const pricelist = await Pricelist.find();
  for (let { _id } of clients) {
    const defaultPricelist = ObjectId(pricelist[0]._id);
    await Clients.updateOne({ _id }, { defaultPricelist });
  }
}

module.exports = { setDefaultPricelist }
