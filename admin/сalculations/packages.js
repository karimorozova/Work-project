const { getVendor, getVendors } = require('../vendors/getVendors');
const { getClient } = require('../clients/getClients');
const { hasActiveRateValue } = require('./general');

async function getFinanceDataForPackages({project, service, packageSize, target}) {
    const { step } = service.steps[0];
    const industryId = project.industry.id;
    try {
        const { vendor, vendorRate, payables } = await getVendorWithPayables({packageSize, target, step, industryId});
        const { receivables, clientRate } = await getReceivables({project, packageSize, target, step, industryId});
        return  { vendor, vendorRate, clientRate, payables, receivables };
    } catch(err) {
        console.log(err);
        console.log("Error in getFinanceForPackages");
    }
}

async function getReceivables({project, packageSize, target, step, industryId}) {
    try {
        const client = await getClient({"_id": project.customer.id});
        const ratePair = client.monoRates.find(item => {
            return item.target.symbol === target.symbol && item.packageSize === packageSize 
            && hasActiveRateValue({step, pair: item, stepIndustry: industryId})
        })
        if(ratePair) {
            const { min, value } = ratePair.rates[step._id];
            const receivables = value > min ? value : min;
            return {receivables, clientRate: ratePair.rates[step._id]};
        }
        return {receivables: 0, clientRate: ""};
    } catch(err) {
        console.log(err);
        console.log("Error in getReceivables");
    }
}

async function getVendorWithPayables({packageSize, target, step, industryId}) {
    try {
        const vendors = await getVendors({status: 'Active'});
        const matchedVendors = vendors.filter(item => isVendorMatches({
            rates: item.monoRates, packageSize, target, step, industryId
        }))
        if(matchedVendors.length === 1) {
            return getVendorRate({vendor: matchedVendors[0], packageSize, target, industryId, step});
        }
        return {vendor: null, vendorRate: "", payables: 0};
    } catch(err) {
        console.log(err);
        console.log("Error in getVendorWithPayables");
    }
}

function getVendorRate({vendor, packageSize, target, industryId, step}) {
    const ratePair = vendor.monoRates.find(item => {
        return item.target.symbol === target.symbol && item.packageSize === packageSize 
        && hasActiveRateValue({step, pair: item, stepIndustry: industryId})
    })
    const { min, value } = ratePair ? ratePair.rates[step._id] : {min: 0, value: 0};
    const payables = value > min ? value : min;            
    return {vendor, vendorRate: ratePair ? ratePair.rates[step._id] : "", payables};
}

function isVendorMatches({rates, packageSize, target, step, industryId}) {
    return rates.find(item => {
        if(item.target.symbol === target.symbol && 
            item.packageSize === packageSize) {
                return hasActiveRateValue({
                        step, 
                        pair: item, 
                        stepIndustry: industryId
                    });
        }
    })
}

async function getAfterPackagesPayablesUpdated({project, step}) {
    let {tasks, steps} = project;
    try {
        const vendor = await getVendor({"_id": step.vendor._id});
        const { vendorRate, payables } = getVendorRate({
            vendor, packageSize: step.packageSize, target: {symbol: step.target}, industryId: project.industry.id, step
        });
        const updatedSteps = getUpdatesSteps({steps, payables, vendorRate, step});
        const updatedTasks = getUpdatesTasks({tasks, payables, step});
        // return await getUpdatedProjectAfterFinanceRecalculated({project, tasks: updatedTasks, steps: updatedSteps});
        return { updatedTasks, updatedSteps }
    } catch(err) {
        console.log(err);
        console.log('Error in getAfterPackagesPayablesUpdated');
    }
}

function getUpdatesSteps({steps, payables, vendorRate, step}) {
    return steps.map(item => {
        if(item.stepId === step.stepId) {
            item.finance.Price.payables = payables;
            item.vendorRate = vendorRate;
        }
        return item;
    })
}

function getUpdatesTasks({tasks, payables, step}) {
    return tasks.map(item => {
        if(item.taskId === step.taskId) {
            item.finance.Price.payables = payables;
        }
        return item;
    })
}

module.exports = { getFinanceDataForPackages, getAfterPackagesPayablesUpdated }