const { getVendor, getVendors } = require('../vendors/getVendors');
const { getClient } = require('../clients/getClients');
const { hasActiveRateValue, getVendorRate, isVendorMatches, getUpdatedSteps, getUpdatedTasks } = require('./general');
const { getProjectAfterFinanceUpdated } = require("../projects/porjectFinance");

async function getFinanceDataForPackages({project, service, packageSize, target}, common = false) {
    const { step } = service.steps[0];
    const industryId = project.industry.id;
    try {
        const { vendor, vendorRate, payables } = await getVendorWithPayables({packageSize, target, step, industryId});
        const { receivables, clientRate } = await getReceivables({project, packageSize, target, step, industryId}, common);
        return  { vendor, vendorRate, clientRate, payables, receivables };
    } catch(err) {
        console.log(err);
        console.log("Error in getFinanceForPackages");
    }
}

async function getReceivables({project, packageSize, target, step, industryId}, common = false) {
    try {
      // const clientId = common ? project.customer.toString() : project.customer.id;
      //   const client = await getClient({"_id": clientId});
      //   const ratePair = client.monoRates.find(item => {
      //       return item.target.symbol === target.symbol && item.packageSize === packageSize
      //       && hasActiveRateValue({step, pair: item, stepIndustry: industryId})
      //   })
      //   if(ratePair) {
      //       const { min, value } = ratePair.rates[step._id];
      //       const receivables = value > min ? value : min;
      //       return {receivables, clientRate: ratePair.rates[step._id]};
      //   }
      return { receivables: 0, clientRate: "" };
    } catch(err) {
        console.log(err);
        console.log("Error in getReceivables");
    }
}

async function getVendorWithPayables({packageSize, target, step, industryId}) {
    try {
      // const vendors = await getVendors({status: 'Active'});
      // const matchedVendors = vendors.filter(item => isVendorMatches({
      //     rates: item.monoRates, packageSize, target, step, industryId
      // }))
      // if(matchedVendors.length === 1) {
      //     return getVendorRate({
      //         vendor: matchedVendors[0], ratesProp: 'monoRates', packageSize, target, industryId, step
      //     });
      // }
      return { vendor: null, vendorRate: "", payables: 0 };
    } catch(err) {
        console.log(err);
        console.log("Error in getVendorWithPayables");
    }
}

async function getAfterPackagesPayablesUpdated({project, step}) {
    let {tasks, steps} = project;
    try {
        const vendor = await getVendor({"_id": step.vendor._id});
        const { vendorRate, payables } = getVendorRate({
            vendor,
            packageSize: step.packageSize,
            ratesProp: 'monoRates',
            target: {symbol: step.targetLanguage},
            industryId: project.industry.id,
            step: step.serviceStep
        });
        const updatedSteps = getUpdatedSteps({steps, payables, vendorRate, step});
        const updatedTasks = getUpdatedTasks({tasks, payables, step});
        return await getProjectAfterFinanceUpdated({project, tasks: updatedTasks, steps: updatedSteps})
    } catch(err) {
        console.log(err);
        console.log('Error in getAfterPackagesPayablesUpdated');
    }
}

module.exports = { getFinanceDataForPackages, getAfterPackagesPayablesUpdated }
