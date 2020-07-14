const { Clients } = require('../models');

const changeClientPricelist = async (clientId, pricelistItem) => {
  try {
    const { _id: rowId, price, altered, notification } = pricelistItem;
    const client = await Clients.findOne({ _id: clientId });
    const { pricelistTable } = client.rates;
    const neededRowIndex = pricelistTable.findIndex(item => item._id.toString() === rowId);
    pricelistTable[neededRowIndex].price = price;
    pricelistTable[neededRowIndex].altered = altered;
    pricelistTable[neededRowIndex].notification = notification;
    client.rates.pricelistTable = pricelistTable;
    await Clients.updateOne({ _id: clientId }, { rates: client.rates });
  } catch (err) {
    console.log(err);
    console.log('Error in changeClientPricelist');
  }
};

module.exports = { changeClientPricelist };
