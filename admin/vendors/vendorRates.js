const { getVendor, getVendorAfterUpdate } = require("./getVendors");
const { manageMonoPairRates, manageDuoPairRates, fillEmptyRates, fillNonEmptyMonoRates, fillNonEmptyDuoRates } = require("../rates/ratesmanage");

async function updateVendorRates(vendor, rateInfo) {
    const { stepsIds, prop, packageSize, industries, source, target, rates } = rateInfo;
    try {
        let updatedRates = [];
        if(prop === 'monoRates') {
            updatedRates = await manageMonoPairRates({
                stepsIds, packageSize, industries, target, rates, currentRates: vendor[prop], entity: vendor
            });
        } else {
            updatedRates = await manageDuoPairRates({
                stepsIds, source, target, industries, rates, currentRates: vendor[prop], entity: vendor
            });
        }
        return await getVendorAfterUpdate({"_id": vendor.id}, {[prop]: updatedRates});
    } catch(err) {
        console.log(err);
        console.log("Error in updateVendorRates");
    }
}

async function importRates({vendorId, ratesData, prop}) {
    try {
        if(prop === 'monoRates') {
            return await getAfterImportMono(vendorId, ratesData);
        }
        return await getAfterImportDuo({vendorId, ratesData, prop});
    } catch(err) {
        console.log(err);
        console.log("Error in importRates");
    }
}

/// Mono rates manage start ///

async function getAfterImportMono(vendorId, ratesData) {
    let { copyRates, industries, stepsIds, packages, targets } = ratesData;
    const isAllIndustries = industries[0] === 'All'
    try {
        const vendor = await getVendor({"_id": vendorId});
        if(isAllIndustries) {
            industries = vendor.industries;
        }
        const targetsIds = targets.map(item => item._id);
        const allAvailablePairs = copyRates.filter(item => packages.indexOf(item.packageSize) !== -1 && targetsIds.indexOf(item.target._id)!== -1);
        let monoRates = vendor.monoRates.length ? [...vendor.monoRates] : [];
        if(!monoRates.length) {
            monoRates = fillEmptyRates({allAvailablePairs, stepsIds, industries});
        } else {
            monoRates = fillNonEmptyMonoRates({allAvailablePairs, stepsIds, industries, monoRates, isAllIndustries});
        }
        return await getVendorAfterUpdate({"_id": vendorId}, { monoRates });
    } catch(err) {
        console.log(err);
        console.log("Error in getAfterImportMono");
    }
}

/// Mono rates manage end ///

/// Duo rates manage start ///

async function getAfterImportDuo({vendorId, ratesData, prop}) {
    let { copyRates, industries, stepsIds, sources, targets } = ratesData;
    const isAllIndustries = industries[0] === 'All'
    try {
        const vendor = await getVendor({"_id": vendorId});
        if(isAllIndustries) {
            industries = vendor.industries;
        }
        const sourcesIds = sources.map(item => item._id);
        const targetsIds = targets.map(item => item._id);
        const allAvailablePairs = copyRates.filter(item => sourcesIds.indexOf(item.source._id) !== -1 && targetsIds.indexOf(item.target._id)!== -1);
        let duoRates = vendor[prop].length ? [...vendor[prop]] : [];
        if(!duoRates.length) {
            duoRates = fillEmptyRates({allAvailablePairs, stepsIds, industries});
        } else {
            duoRates = fillNonEmptyDuoRates({allAvailablePairs, stepsIds, industries, duoRates, isAllIndustries});
        }
        return await getVendorAfterUpdate({"_id": vendorId}, { [prop]: duoRates });
    } catch(err) {
        console.log(err);
        console.log("Error in getAfterImportDuo");
    }
}

/// Duo rates manage end ///
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

module.exports= { updateVendorRates, importRates, getVendorAfterCombinationsUpdated };