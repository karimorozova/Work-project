const { Pricelist, Clients, Vendors } = require('../models');
const { tableKeys } = require('../enums');

const postNotifications = async (pricelistId, updatedRow, key) => {
  const { isVendorDefault } = await Pricelist.findOne({ _id: pricelistId });
  let relatedClients = await Clients.find({ defaultPricelist: pricelistId });
  let relatedVendors = isVendorDefault ? await Vendors.find() : [];
  let tableName = 'basicPricesTable';
  const notification = 'Pricelist data has been updated';
  switch (key) {
    case tableKeys.basicPricesTable:
      await throughAllUsers(relatedClients, tableName, updateBasicPriceRow, Clients);
      if (relatedVendors.length) {
        await throughAllUsers(relatedVendors, tableName, updateBasicPriceRow, Vendors);
      }
      break;
    case tableKeys.stepMultipliersTable:
      tableName = 'stepMultipliersTable';
      await throughAllUsers(relatedClients, tableName, updateStepMultiplierRow, Clients);
      if (relatedVendors.length) {
        await throughAllUsers(relatedVendors, tableName, updateStepMultiplierRow, Vendors);
      }
      break;
    case tableKeys.industryMultipliersTable:
      tableName = 'industryMultipliersTable';
      await throughAllUsers(relatedClients, tableName, updateIndustryMultiplierRow, Clients);
      if (relatedVendors.length) {
        await throughAllUsers(relatedVendors, tableName, updateIndustryMultiplierRow, Vendors);
      }
  }

  async function throughAllUsers (usersArr, tableName, functionName, collectionName) {
    for (let { _id, rates } of usersArr) {
      const neededTable = rates[tableName];
      rates[tableName] = functionName(neededTable);
      await collectionName.updateOne({ _id }, { rates });
    }
  }

  function updateBasicPriceRow (arr) {
    return arr.map(row => {
      if (row.sourceLanguage.toString() === updatedRow.sourceLanguage._id.toString() &&
        row.targetLanguage.toString() === updatedRow.targetLanguage._id.toString()) {
        row.altered = true;
        row.notification = notification;
      }
      return row;
    });
  }

  function updateStepMultiplierRow (arr) {
    return arr.map(row => {
      if (row.step.toString() === updatedRow.step._id.toString() &&
        row.unit.toString() === updatedRow.unit._id.toString() &&
        Number(row.size) === Number(updatedRow.size)) {
        row.altered = true;
        row.notification = notification;
      }
      return row;
    });
  }

  function updateIndustryMultiplierRow (arr) {
    return arr.map(row => {
      if (row.industry.toString() === updatedRow.industry._id.toString()) {
        row.altered = true;
        row.notification = notification;
      }
      return row;
    });
  }
};

module.exports = { postNotifications };
