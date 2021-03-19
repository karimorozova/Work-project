const { Vendors } = require("../models");
const { getFilteringQuery } = require("./filter");

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
    const vendors = await Vendors.aggregate([
      { $addFields: { "name": { $concat: ["$firstName", " ", "$surname"] } } },
      { $match: query },
      { $unset: [
          'assessments',
          'availability',
          'basicRate',
          'catExperience',
          'companyName',
          'coverLetterFiles',
          'currency',
          'cvFiles',
          'documents',
          'educations',
          'email',
          'experienceYears',
          'gender',
          'guid',
          'internetAccess',
          'languagePairs',
          'linkedin',
          'matrix',
          'notes',
          'password',
          'phone',
          'photo',
          'positions',
          'profExperiences',
          'professionalLevel',
          'qualifications',
          'skype',
          'softwares',
          'temporaryEyes',
          'timezone',
          'tqi',
          'website',
          'whatsapp',
          'wordCountInfo',
        ]}
    ]).sort({ _id: 1 }).limit(25);

    return Vendors.populate(vendors, [
      "industries",
      "native",
    ])
  } catch (err) {
    console.log(err);
    console.log("Error on filtering vendors");
  }
}

module.exports = { getVendor, getVendors, getVendorAfterUpdate, getFilteredVendors, hasVendorCompetenciesAndPending};
