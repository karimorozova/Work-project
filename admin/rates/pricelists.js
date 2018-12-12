const { Pricelist } = require("../models");

async function saveNewPricelist(pricelist) {
    const { name, isActive, isDefault, copyName } = pricelist;
    try {
        const donorPricelist = copyName ? await Pricelist.findOne({"name": copyName}) : "";
        const combinations = donorPricelist ? [...donorPricelist.combinations] : [];
        return await createNewPricelist({name, isActive, isDefault, combinations});
    } catch(err) {
        console.log(err);
        console.log("Error in saveNewPricelist");
    }
}

async function createNewPricelist({name, isActive, isDefault, combinations}) {
    try {
        if(isDefault) {
            await Pricelist.updateOne({"isDefault": true}, {"isDefault": !isDefault});
            return await Pricelist.create({name, isDefault, isActive, combinations});
        }
        return await Pricelist.create({name, isDefault, isActive, combinations});
    } catch(err) {
        console.log(err);
        console.log("Error in createNewPricelist");
    }
}

async function deletePricelist(id, isDefault) {
    try {
        if(!isDefault) {
            return await Pricelist.deleteOne({"_id": id});
        }
        const firstPrice = await Pricelist.find().limit(1);
        if(firstPrice.length) {
            const defaultId = firstPrice[0].id;
            await Pricelist.deleteOne({"_id": id});
            await Pricelist.updateOne({"_id": defaultId}, {isDefault: isDefault});
        } 
    } catch(err) {
        console.log(err);
        console.log("Error in deletePricelist");
    }
}

module.exports = { saveNewPricelist, deletePricelist };