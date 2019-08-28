const { getClientAfterUpdate, getClient } = require("./getClients");
const { manageMonoPairRates, manageDuoPairRates, fillEmptyRates, fillNonEmptyMonoRates, fillNonEmptyDuoRates, getRateInfoFromStepFinance } = require("../rates/ratesmanage");

async function updateClientRates(client, rateInfo) {
    const { stepsIds, prop, packageSize, industries, source, target, rates } = rateInfo;
    try {
        let updatedRates = [];
        if(prop === 'monoRates') {
            updatedRates = await manageMonoPairRates({
                stepsIds, packageSize, industries, target, rates, currentRates: client[prop], entity: client
            });
        } else {
            updatedRates = await manageDuoPairRates({
                stepsIds, source, target, industries, rates, currentRates: client[prop], entity: client
            });
        }
        return await getClientAfterUpdate({"_id": client.id}, {[prop]: updatedRates});
    } catch(err) {
        console.log(err);
        console.log("Error in updateClientRates");
    }
}

async function importRates({clientId, ratesData, prop}) {
    try {
        if(prop === 'monoRates') {
            return await getAfterImportMono(clientId, ratesData);
        }
        return await getAfterImportDuo({clientId, ratesData, prop});
    } catch(err) {
        console.log(err);
        console.log("Error in importRates");
    }
}

/// Mono rates manage start ///

async function getAfterImportMono(clientId, ratesData) {
    let { copyRates, industries, stepsIds, packages, targets } = ratesData;
    const isAllIndustries = industries[0] === 'All'
    try {
        const client = await getClient({"_id": clientId});
        if(isAllIndustries) {
            industries = client.industries;
        }
        const targetsIds = targets.map(item => item._id);
        const allAvailablePairs = copyRates.filter(item => packages.indexOf(item.packageSize) !== -1 && targetsIds.indexOf(item.target._id)!== -1);
        let monoRates = client.monoRates.length ? [...client.monoRates] : [];
        if(!monoRates.length) {
            monoRates = fillEmptyRates({allAvailablePairs, stepsIds, industries});
        } else {
            monoRates = fillNonEmptyMonoRates({allAvailablePairs, stepsIds, industries, monoRates, isAllIndustries});
        }
        return await getClientAfterUpdate({"_id": clientId}, { monoRates });
    } catch(err) {
        console.log(err);
        console.log("Error in getAfterImportMono");
    }
}

/// Mono rates manage end ///

/// Duo rates manage start ///

async function getAfterImportDuo({clientId, ratesData, prop}) {
    let { copyRates, industries, stepsIds, sources, targets } = ratesData;
    const isAllIndustries = industries[0] === 'All'
    try {
        const client = await getClient({"_id": clientId});
        if(isAllIndustries) {
            industries = client.industries;
        }
        const sourcesIds = sources.map(item => item._id);
        const targetsIds = targets.map(item => item._id);
        const allAvailablePairs = copyRates.filter(item => sourcesIds.indexOf(item.source._id) !== -1 && targetsIds.indexOf(item.target._id)!== -1);
        let duoRates = client[prop].length ? [...client[prop]] : [];
        if(!duoRates.length) {
            duoRates = fillEmptyRates({allAvailablePairs, stepsIds, industries});
        } else {
            duoRates = fillNonEmptyDuoRates({allAvailablePairs, stepsIds, industries, duoRates, isAllIndustries});
        }
        return await getClientAfterUpdate({"_id": clientId}, { [prop]: duoRates });
    } catch(err) {
        console.log(err);
        console.log("Error in getAfterImportDuo");
    }
}

/// Duo rates manage end ///

async function getClientAfterCombinationsUpdated({project, step, rate}) {
    try {
        const rateInfo = await getRateInfoFromStepFinance({project, step, rate});
        const client = await getClient({"_id": project.customer.id});
        return await updateClientRates(client, rateInfo);
    } catch(err) {
        console.log(err);
        console.log("Error in getClientAfterCombinationsUpdated");
    }
}

module.exports= { updateClientRates, importRates, getClientAfterCombinationsUpdated };