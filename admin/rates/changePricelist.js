const { Client } = require('../models');
const changeClientPricelist = async (clientId, pricelistItem) => {
  try {
    const { _id: rowId, price, altered, notification } = pricelistItem;
    const client = await Client.findOne({ id: clientId });
    const { pricelistTable } = client.rates;
    const neededRowIndex = pricelistTable.findIndex(item => item._id.toString() === rowId);
    pricelistTable[neededRowIndex].price = price;
    pricelistTable[neededRowIndex].altered = altered;
    pricelistTable[neededRowIndex].notification = notification;
    await Client.updateOne({ _id: clientId }, { rates: { pricelistTable } });
  } catch (err) {
    console.log(err);
    console.log('Error in changeClientPricelist');
  }
};

module.exports = { changeClientPricelist };
