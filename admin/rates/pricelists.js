const { Pricelist } = require("../models");
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

async function deletePricelist(id, isClientDefault, isVendorDefault) {
    try {
        if(!isClientDefault && !isVendorDefault) {
            return await Pricelist.deleteOne({"_id": id});
        }
        const firstPrice = await Pricelist.find().limit(1);
        const defaultId = firstPrice[0].id;
        if(firstPrice.length) {
            await Pricelist.deleteOne({"_id": id});
            await setDefaultPrice(defaultId, isClientDefault, isVendorDefault);
        } 
    } catch(err) {
        console.log(err);
        console.log("Error in deletePricelist");
    }
}

async function setDefaultPrice(defaultId, isClientDefault, isVendorDefault) {
    try {
        if(isClientDefault && isVendorDefault) {
          return await Pricelist.updateOne({"_id": defaultId}, { isClientDefault, isVendorDefault });
        }
        isClientDefault ? await Pricelist.updateOne({"_id": defaultId}, { isClientDefault })
                : await Pricelist.updateOne({"_id": defaultId}, { isVendorDefault });
    } catch(err) {
        console.log(err);
        console.log("Error in setDefaultPrice");
    }
}

module.exports = { saveNewPricelist, deletePricelist };