const { getVendors } = require('../vendors/getVendors');
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
        // if(matchedVendors.length === 1) {
            const ratePair = matchedVendors[0].monoRates.find(item => {
                return item.target.symbol === target.symbol && item.packageSize === packageSize 
                && hasActiveRateValue({step, pair: item, stepIndustry: industryId})
            })
            const { min, value } = ratePair.rates[step._id];
            const payables = value > min ? value : min;            
            return {vendor: matchedVendors[0].id, vendorRate: ratePair.rates[step._id], payables};
        // }
        return {vendor: null, vendorRate: "", payables: 0};
    } catch(err) {
        console.log(err);
        console.log("Error in getVendorWithPayables");
    }
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

module.exports = { getFinanceDataForPackages }