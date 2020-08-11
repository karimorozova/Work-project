const { Clients, Vendors } = require('../models');
const { getVendor } = require('../vendors');

const changeClientPricelist = async (subjectId, pricelistItem, fromVendor = false) => {
  try {
    const { _id: rowId, price, altered, notification } = pricelistItem;
    const subject = fromVendor ? await getVendor({ _id: subjectId }) : await Clients.findOne({ _id: subjectId });
    const { pricelistTable } = subject.rates;
    const neededRowIndex = pricelistTable.findIndex(item => item._id.toString() === rowId);
    const { price: oldPrice } = pricelistTable[neededRowIndex];
    if (oldPrice === Number(price)) return;
    pricelistTable[neededRowIndex].price = price;
    pricelistTable[neededRowIndex].altered = altered;
    pricelistTable[neededRowIndex].notification = notification;
    subject.rates.pricelistTable = pricelistTable;
    const updateSubject = fromVendor ? Vendors : Clients;
    await updateSubject.updateOne({ _id: subjectId }, { rates: subject.rates });
  } catch (err) {
    console.log(err);
    console.log('Error in changeClientPricelist');
  }
};

module.exports = { changeClientPricelist };
