const { Pricelist, Clients } = require("../models");
const { getDefaultBasicPrices, getDefaultStepMultipliers, getDefaultIndustryMultipliers } = require('../helpers/defaults/defaultPriceLists')

async function saveNewPricelist(pricelist) {
    let { name, isActive, isClientDefault, isVendorDefault, basicPricesTable,
         industryMultipliersTable, stepMultipliersTable, copyName } = pricelist;
    try {
        if(copyName !== ''){
            const donorPricelist = await Pricelist.findOne({"name": copyName});
            basicPricesTable = donorPricelist.basicPricesTable
            industryMultipliersTable = donorPricelist.industryMultipliersTable
            stepMultipliersTable = donorPricelist.stepMultipliersTable
        }else{
            basicPricesTable = await getDefaultBasicPrices()
            industryMultipliersTable = await getDefaultIndustryMultipliers()
            stepMultipliersTable = await getDefaultStepMultipliers()
        }
        return await Pricelist.create({
            name, isClientDefault, isVendorDefault, isActive, basicPricesTable, industryMultipliersTable, stepMultipliersTable
        });
    } catch(err) {
        console.log(err);
        console.log("Error in saveNewPricelist");
    }
}

async function deletePricelist(id, isVendorDefault) {
  try {
    const isUsingByClient = await checkClientUsage(id);
    if (!isVendorDefault && !isUsingByClient) {
      await Pricelist.deleteOne({ "_id": id });
      return true;
    }
    return false;
  } catch(err) {
    console.log(err);
    console.log("Error in deletePricelist");
    }
}

/**
 *
 * @param pricelistId {ObjectId} - current pricelist id
 * @return {Boolean} - checks if current pricelist is in use in any client
 */
const checkClientUsage = async (pricelistId) => {
  const clients = await Clients.find();
  return clients.some(client => (
    client.defaultPricelist.toString() === pricelistId.toString()
  ))
}

module.exports = { saveNewPricelist, deletePricelist };
