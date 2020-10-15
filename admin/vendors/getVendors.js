const { Vendors } = require("../models");
const { getFilteringQuery } = require("./filter");

async function getVendor(query) {
  const vendor = await Vendors.findOne(query)
    .populate("native")
    .populate('industries', ['name', 'icon'])
    .populate("languagePairs.source")
    .populate("languagePairs.target")
    .populate("qualifications.source", ['lang'])
    .populate("qualifications.target", ['lang'])
    .populate("qualifications.industry", ['name'])
    .populate("qualifications.steps", ['title'])
    .populate("assessments.sourceLanguage", ['lang'])
    .populate("assessments.targetLanguage", ['lang'])
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
    .populate('rates.pricelistTable.industry', ['name']);
  return vendor;
}

async function getVendors(query) {
  const vendors = await Vendors.find(query)
    .populate("native")
    .populate('industries', ['name', 'icon'])
    .populate("languagePairs.source")
    .populate("languagePairs.target")
    .populate("qualifications.source", ['lang'])
    .populate("qualifications.target", ['lang'])
    .populate("qualifications.industry", ['name'])
    .populate("qualifications.steps", ['title'])
    .populate("assessments.sourceLanguage", ['lang'])
    .populate("assessments.targetLanguage", ['lang'])
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
  return vendors;
}

async function getVendorAfterUpdate(query, update) {
  return await Vendors.findOneAndUpdate(query, update, { new: true })
    .populate("native")
    .populate('industries', ['name', 'icon'])
    .populate("languagePairs.source")
    .populate("languagePairs.target")
    .populate("qualifications.source", ['lang'])
    .populate("qualifications.target", ['lang'])
    .populate("qualifications.industry", ['name'])
    .populate("qualifications.steps", ['title'])
    .populate("assessments.sourceLanguage", ['lang'])
    .populate("assessments.targetLanguage", ['lang'])
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

async function getFilteredVendors(filters) {
  try {
    const query = getFilteringQuery(filters);
    const vendors = await Vendors.aggregate([
      { $addFields: { "name": { $concat: ["$firstName", " ", "$surname"] } } },
      { $match: query },
    ]).sort({ _id: 1 }).limit(25);

    return Vendors.populate(vendors, [
      "industries",
    ])
  } catch (err) {
    console.log(err);
    console.log("Error on filtering vendors");
  }
}

module.exports = { getVendor, getVendors, getVendorAfterUpdate, getFilteredVendors };
