const { Vendors } = require("../models");
const { getFilteringQuery, getFilteringQueryPotential  } = require("./filter");
const moment = require('moment')

async function getVendor(query) {
  return await Vendors.findOne(query)
    .populate('native')
    .populate('industries', ['name', 'icon'])
    .populate('languagePairs.source')
    .populate('languagePairs.target')
    .populate('qualifications.source', ['lang'])
    .populate('qualifications.target', ['lang'])
    .populate('qualifications.industries', ['name'])
    .populate('qualifications.steps', ['title'])
    .populate('assessments.sourceLanguage', ['lang'])
    .populate('assessments.targetLanguage', ['lang'])
    .populate("assessments.industries.industry", ['name'])
    .populate("assessments.industries.steps.step", ['title'])
    .populate('competencies.sourceLanguage', ['lang'])
    .populate('competencies.targetLanguage', ['lang'])
    .populate('competencies.industry', ['name'])
    .populate('competencies.step', ['title'])
    .populate('competencies.step.calculationUnit', ['type'])
    .populate('rates.basicPricesTable.sourceLanguage', ['lang', 'iso1'])
    .populate('rates.basicPricesTable.targetLanguage', ['lang', 'iso1'])
    .populate('rates.stepMultipliersTable.step', ['title'])
    .populate('rates.stepMultipliersTable.unit', ['type'])
    .populate('rates.industryMultipliersTable.industry', ['name', 'icon'])
    .populate('rates.pricelistTable.sourceLanguage', ['lang'])
    .populate('rates.pricelistTable.targetLanguage', ['lang'])
    .populate('rates.pricelistTable.step', ['title'])
    .populate('rates.pricelistTable.unit', ['type'])
    .populate('rates.pricelistTable.industry', ['name'])
    .populate('pendingCompetencies.sourceLanguage', ['lang'])
    .populate('pendingCompetencies.targetLanguage', ['lang'])
    .populate('pendingCompetencies.industry', ['name'])
    .populate('pendingCompetencies.step', ['title']);
}

async function hasVendorCompetenciesAndPending (vendorId){
  const vendor = await Vendors.findOne({_id: vendorId})
  return !vendor.competencies.length && !vendor.pendingCompetencies.length
}

async function getVendors(query) {
  return await Vendors.find(query)
    .populate('native')
    .populate('industries', ['name', 'icon'])
    .populate('languagePairs.source')
    .populate('languagePairs.target')
    .populate('qualifications.source', ['lang'])
    .populate('qualifications.target', ['lang'])
    .populate('qualifications.industries', ['name'])
    .populate('qualifications.steps', ['title'])
    .populate('assessments.sourceLanguage', ['lang'])
    .populate('assessments.targetLanguage', ['lang'])
    .populate("assessments.industries.industry", ['name'])
    .populate("assessments.industries.steps.step", ['title'])
    .populate('competencies.sourceLanguage', ['lang'])
    .populate('competencies.targetLanguage', ['lang'])
    .populate('competencies.industry', ['name'])
    .populate('competencies.step', ['title'])
    .populate('competencies.step.calculationUnit', ['type'])
    .populate('rates.basicPricesTable.sourceLanguage', ['lang', 'iso1'])
    .populate('rates.basicPricesTable.targetLanguage', ['lang', 'iso1'])
    .populate('rates.stepMultipliersTable.step', ['title'])
    .populate('rates.stepMultipliersTable.unit', ['type'])
    .populate('rates.industryMultipliersTable.industry', ['icon'])
    .populate('rates.pricelistTable.sourceLanguage', ['lang'])
    .populate('rates.pricelistTable.targetLanguage', ['lang'])
    .populate('rates.pricelistTable.step', ['title'])
    .populate('rates.pricelistTable.unit', ['type'])
    .populate('rates.pricelistTable.industry', ['name']);
}

async function getVendorAfterUpdate(query, update) {
  return await Vendors.findOneAndUpdate(query, update, { new: true })
    .populate("native")
    .populate('industries', ['name', 'icon'])
    .populate("languagePairs.source")
    .populate("languagePairs.target")
    .populate("qualifications.source", ['lang'])
    .populate("qualifications.target", ['lang'])
    .populate("qualifications.industries", ['name'])
    .populate("qualifications.steps", ['title'])
    .populate("assessments.sourceLanguage", ['lang'])
    .populate("assessments.targetLanguage", ['lang'])
    .populate("assessments.industries.industry", ['name'])
    .populate("assessments.industries.steps.step", ['title'])
    .populate('competencies.sourceLanguage', ['lang', 'symbol'])
    .populate('competencies.targetLanguage', ['lang', 'symbol'])
    .populate('competencies.industry', ['name'])
    .populate('competencies.step', ['title'])
    .populate('competencies.step.calculationUnit', ['type'])
    .populate('rates.basicPricesTable.sourceLanguage', ['lang', 'iso1'])
    .populate('rates.basicPricesTable.targetLanguage', ['lang', 'iso1'])
    .populate('rates.stepMultipliersTable.step', ['title'])
    .populate('rates.stepMultipliersTable.unit', ['type'])
    .populate('rates.industryMultipliersTable.industry', ['icon'])
    .populate('rates.pricelistTable.sourceLanguage', ['lang'])
    .populate('rates.pricelistTable.targetLanguage', ['lang'])
    .populate('rates.pricelistTable.step', ['title'])
    .populate('rates.pricelistTable.unit', ['type'])
    .populate('rates.pricelistTable.industry', ['name'])
    .populate('pendingCompetencies.sourceLanguage', ['lang'])
    .populate('pendingCompetencies.targetLanguage', ['lang'])
    .populate('pendingCompetencies.industry', ['name'])
    .populate('pendingCompetencies.step', ['title']);
}


async function getFilteredVendors(filters) {
  try {
    const query = getFilteringQuery(filters);
    return await Vendors.find(query, {
          firstName: 1,
          status: 1,
          surname:1,
          competencies: 1,
          native: 1,
          industries: 1,
          isTest: 1,
        })
        .sort({ _id: 1 }).limit(25)
        .populate("industries")
        .populate("native")
        .populate('pendingCompetencies.sourceLanguage')
        .populate('pendingCompetencies.targetLanguage')
  } catch (err) {
    console.log(err)
    console.log("Error on filtering vendors")
  }
}
async function getFilteredVendorsWithCustomFilters(filters, customFilters = {}){
  try {
    const query = {...getFilteringQuery(filters), ...customFilters};
    return await Vendors.find(query, {
      firstName: 1,
      status: 1,
      surname:1,
      competencies: 1,
      native: 1,
      industries: 1,
      isTest: 1,
    })
      .sort({ _id: 1 }).limit(25)
      .populate("industries")
      .populate("native")
  } catch (err) {
    console.log(err)
    console.log("Error on filtering vendors")
  }
}

async function getFilteredVendorsPotential(filters){
  try {
    const query = getFilteringQueryPotential(filters);

    const query = getFilteringQueryPotential(filters);

    let vendors = await Vendors.find(query, {
      firstName: 1,
      status: 1,
      surname: 1,
      competencies: 1,
      native: 1,
      industries: 1,
      isTest: 1,
      dateInfo: 1,
    }).sort({ _id: 1 }).limit(25)
      .populate("industries")
      .populate("native")
      .populate('pendingCompetencies.sourceLanguage')
      .populate('pendingCompetencies.targetLanguage')

    const rebuildVendors = vendors.map(item => {
      return {
        ...item._doc,
        date: moment(item._doc.dateInfo.createdAt).format("DD-MM-YYYY, HH:ss")
      }
    })


    return rebuildVendors

  } catch (err) {
    console.log(err)
    console.log("Error on filtering vendors")
  }
}

module.exports = { getVendor, getVendors, getVendorAfterUpdate, getFilteredVendors, getFilteredVendorsWithCustomFilters, hasVendorCompetenciesAndPending, getFilteredVendorsPotential};
