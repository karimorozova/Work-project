const { Vendors, Languages } = require('../models');

const getFittingVendor = async (stepData) => {
  stepData.sourceLanguage = await Languages.findOne({ symbol: stepData.sourceLanguage });
  stepData.targetLanguage = await Languages.findOne({ symbol: stepData.targetLanguage });
  stepData.industry = stepData.industry._id;
  const vendors = await Vendors.find();
  const fittingVendors = findFittingVendor(stepData, vendors);
  if (fittingVendors.length === 1) {
    return fittingVendors[0];
  }
  return null;
};

const findFittingVendor = (stepData, vendors) => {
  const { sourceLanguage, targetLanguage, step, industry } = stepData;
  const fittingVendors = [];
  for (let { _id, qualifications } of vendors) {
    if (qualifications.length) {
      for (let { source, target, steps, industry: vendorIndustry, status } of qualifications) {
        const fittingStep = steps.find(item => item.toString() === step.toString());
        if (fittingStep && source.toString() === sourceLanguage._id.toString() &&
          target.toString() === targetLanguage._id.toString() && vendorIndustry.toString() === industry.toString() &&
          status === 'Passed') {
          fittingVendors.push(_id);
        }
      }
    }
  }
  return fittingVendors;
};

const checkIsSameVendor = (steps) => {
  if (steps.length === 2) {
    if (steps[0].vendor.toString() === steps[1].vendor.toString()) {
      steps[1].vendor = null;
      return steps;
    }
  }
  return steps;
}


module.exports = { getFittingVendor, checkIsSameVendor }
