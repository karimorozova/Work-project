const { Vendors } = require("../models");
const { getFilteringQuery } = require("./filter");

async function getVendor(query) {
  const vendor = await Vendors.findOne(query)
    .populate("native")
    .populate("industries")
    .populate("languagePairs.source")
    .populate("languagePairs.target")
    .populate("qualifications.source")
    .populate("qualifications.target")
    .populate("qualifications.industry")
    .populate("qualifications.steps")
    .populate("assessments.sourceLanguage")
    .populate("assessments.targetLanguage")
    .populate("assessments.industries.industry")
    .populate("assessments.industries.steps.step")
    .populate('competencies.sourceLanguage')
    .populate('competencies.targetLanguage')
    .populate('competencies.industry')
    .populate('competencies.step')
    .populate('rates.basicPricesTable.sourceLanguage')
    .populate('rates.basicPricesTable.targetLanguage')
    .populate('rates.stepMultipliersTable.step')
    .populate('rates.stepMultipliersTable.unit')
    .populate('rates.industryMultipliersTable.industry')
    .populate('rates.pricelistTable.sourceLanguage')
    .populate('rates.pricelistTable.targetLanguage')
    .populate('rates.pricelistTable.step')
    .populate('rates.pricelistTable.unit')
    .populate('rates.pricelistTable.industry');
  return vendor;
}

async function getVendors(query) {
  const vendors = await Vendors.find(query)
    .populate("native")
    .populate("industries")
    .populate("languagePairs.source")
    .populate("languagePairs.target")
    .populate("qualifications.source")
    .populate("qualifications.target")
    .populate("qualifications.industry")
    .populate("qualifications.steps")
    .populate("assessments.sourceLanguage")
    .populate("assessments.targetLanguage")
    .populate("assessments.industries.industry")
    .populate("assessments.industries.steps.step")
    .populate('competencies.sourceLanguage')
    .populate('competencies.targetLanguage')
    .populate('competencies.industry')
    .populate('competencies.step');
  return vendors;
}

async function getVendorAfterUpdate(query, update) {
  return await Vendors.findOneAndUpdate(query, update, { new: true })
    .populate("native")
    .populate("industries")
    .populate("languagePairs.source")
    .populate("languagePairs.target")
    .populate("qualifications.source")
    .populate("qualifications.target")
    .populate("qualifications.industry")
    .populate("qualifications.steps")
    .populate("assessments.sourceLanguage")
    .populate("assessments.targetLanguage")
    .populate("assessments.industries.industry")
    .populate("assessments.industries.steps.step")
    .populate('competencies.sourceLanguage')
    .populate('competencies.targetLanguage')
    .populate('competencies.industry')
    .populate('competencies.step')
    .populate('rates.basicPricesTable')
    .populate('rates.stepMultipliersTable')
    .populate('rates.industryMultipliersTable')
    .populate('rates.pricelistTable');
}

async function getFilteredVendors(filters) {
  try {
    const query = getFilteringQuery(filters);
    const vendors = await Vendors.aggregate([
      { $addFields: { "name": { $concat: ["$firstName", " ", "$surname"] } } },
      { $match: query },
    ]).sort({ _id: 1 }).limit(25);

    return Vendors.populate(vendors, [
      "native",
      "industries",
      "languagePairs.source",
      "languagePairs.target",
      "qualifications.source",
      "qualifications.target",
      "qualifications.industry",
      "qualifications.steps",
      "assessments.sourceLanguage",
      "assessments.targetLanguage",
      "assessments.industries.industry",
      "assessments.industries.steps.step",
    ]);
  } catch (err) {
    console.log(err);
    console.log("Error on filtering vendors");
  }
}

module.exports = { getVendor, getVendors, getVendorAfterUpdate, getFilteredVendors };
