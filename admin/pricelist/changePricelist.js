const { Clients, Vendors } = require('../models');

/**
 *
 * @param {ObjectId}subjectId
 * @param {Object} pricelistItem
 * @param {Boolean} fromVendor
 * @returns nothing - but updates vendor's or client's rates
 */
const changeMainRatePricelist = async (subjectId, pricelistItem, fromVendor = false) => {
  try {
    const { _id: rowId, price, altered, notification } = pricelistItem;
    const neededSubject = fromVendor ? Vendors : Clients;
    const subject = await neededSubject.findOne({ _id: subjectId });
    const { pricelistTable } = subject.rates;
    const neededRowIndex = pricelistTable.findIndex(item => item._id.toString() === rowId);
    const { price: oldPrice } = pricelistTable[neededRowIndex];
    if (oldPrice === Number(price)) return;
    pricelistTable[neededRowIndex].price = price;
    pricelistTable[neededRowIndex].altered = altered;
    pricelistTable[neededRowIndex].notification = notification;
    subject.rates.pricelistTable = pricelistTable;
    await neededSubject.updateOne({ _id: subjectId }, { rates: subject.rates });
  } catch (err) {
    console.log(err);
    console.log('Error in changeMainRatePricelist');
  }
};

module.exports = { changeMainRatePricelist };
