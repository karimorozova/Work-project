const { getVendor, getVendorAfterUpdate } = require("./getVendors");
const { getPricelist } = require("../rates");
const { manageMonoPairRates, manageDuoPairRates } = require("../rates/ratesmanage");

async function updateVendorRates(vendor, rateInfo) {
    const { prop, packageSize, industries, source, target, rates } = rateInfo;
    try {
        let updatedRates = [];
        if(prop === 'monoRates') {
            updatedRates = await manageMonoPairRates({
                packageSize, industries, target, rates, priceRates: vendor[prop], entity: vendor
            });
        } else {
            updatedRates = await manageDuoPairRates({
                source, target, industries, rates, priceRates: vendor[prop], entity: vendor
            });
        }
        return await getVendorAfterUpdate({"_id": vendor.id}, {[prop]: updatedRates});
    } catch(err) {
        console.log(err);
        console.log("Error in updateVendorRates");
    }
}

async function addSeveralCombinations({priceId,vendorId, combinations}) {
   
}

async function getVendorAfterCombinationsUpdated({project, step, rate}) {
    const stepTask = project.tasks.find(item => item.taskId === step.taskId);
    const rateService = stepTask.service;
    const rateIndustry = project.industry.id;
    try {
        const vendor = await getVendor({"_id": step.vendor._id});
        return await getWihtUpdatedCombs({vendor, step, rate, rateService, rateIndustry});
    } catch(err) {
        console.log(err);
        console.log("Error in getVendorAfterCombinationsUpdated");
    }
}

async function getWihtUpdatedCombs({vendor, step, rate, rateService, rateIndustry}) {
    
}

module.exports= { updateVendorRates, addSeveralCombinations, getVendorAfterCombinationsUpdated };