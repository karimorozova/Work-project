const { Pricelist } = require("../models");

async function saveNewPricelist(pricelist) {
    const { name, isActive, isClientDefault, isVendorDefault, copyName } = pricelist;
    try {
        const donorPricelist = copyName ? await Pricelist.findOne({"name": copyName}) : "";
        const { monoRates = [], wordsRates = [], hoursRates = [] } = donorPricelist ? donorPricelist : {};
        return await Pricelist.create({
            name, isClientDefault, isVendorDefault, isActive, monoRates, wordsRates, hoursRates
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