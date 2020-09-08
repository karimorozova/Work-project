const { Languages } = require('../models');
const { getVendor, getVendors } = require('../vendors/getVendors');
const { getClient } = require('../clients/getClients');
const { hasActiveRateValue, isVendorMatches, getVendorRate, getUpdatedSteps, getUpdatedTasks } = require('./general');
const { getProjectAfterFinanceUpdated } = require("../projects/porjectFinance");

async function getHoursStepFinanceData ({ task, serviceStep, project, multiplier }) {
  const industryId = project.industry.id;
  try {
    // const source = { symbol: task.sourceLanguage };
    // const target = { symbol: task.targetLanguage };
    const source = await Languages.findOne({ symbol: task.sourceLanguage });
    const target = await Languages.findOne({ symbol: task.targetLanguage });
    const { vendor, vendorRate, payables } = await getVendorWithPayables({
      source, target, step: serviceStep, industryId, multiplier
    });
    // const { receivables, clientRate } = await getReceivables({
    //     project, source, target, step: serviceStep, industryId, multiplier
    // });
    // return { vendor, vendorRate, payables, receivables, clientRate };
  } catch(err) {
    console.log(err);
    console.log("Error in getHoursStepFinanceData");
  }
}

async function getAfterHoursPayablesUpdated ({ project, step }) {
  let { tasks, steps } = project;
  try {
    const vendor = await getVendor({ "_id": step.vendor._id });
    const { vendorRate, payables } = getVendorRate({
      vendor,
      source: { symbol: step.sourceLanguage },
      ratesProp: 'hoursRates',
      target: { symbol: step.targetLanguage },
      industryId: project.industry.id,
      step: step.serviceStep
    });
    const updatedSteps = getUpdatedSteps({ steps, payables, vendorRate, step });
    const updatedTasks = getUpdatedTasks({ tasks, payables, step });
    return await getProjectAfterFinanceUpdated({ project, tasks: updatedTasks, steps: updatedSteps })
  } catch(err) {
    console.log(err);
    console.log('Error in getAfterPackagesPayablesUpdated');
  }
}

async function getReceivables ({ project, source, target, step, industryId, multiplier }) {
  try {
    const clientId = project.customer._id || project.customer.toString();
    const client = await getClient({ "_id": clientId });
    // const ratePair = client.hoursRates.find(item => {
    //   return item.target.symbol === target.symbol && item.source.symbol === source.symbol
    //     && hasActiveRateValue({ step, pair: item, stepIndustry: industryId })
    // })
    // if (ratePair) {
    //   const { min, value } = ratePair.rates[step._id];
    //   const receivables = value * multiplier > min ? +(value * multiplier).toFixed(2) : min;
    //   return { receivables, clientRate: ratePair.rates[step._id] };
    // }
    return { receivables: 0, clientRate: "" };
  } catch(err) {
    console.log(err);
    console.log("Error in getReceivables (hours)");
  }
}

async function getVendorWithPayables ({ source, target, step, industryId, multiplier }) {
  try {
    const vendors = await getVendors({ status: 'Active' });
    const matchedVendors = vendors.filter(item => isVendorMatches({
      rates: item.rates, source, target, step, industryId
    }));
    if (matchedVendors.length === 1) {
      return getVendorRate({
        vendor: matchedVendors[0], ratesProp: 'hoursRates', source, target, industryId, step, multiplier
      });
    }
    return { vendor: null, vendorRate: "", payables: 0 };
  } catch(err) {
    console.log(err);
    console.log("Error in getVendorWithPayables (hours)");
  }
}

module.exports = { getHoursStepFinanceData, getAfterHoursPayablesUpdated }
