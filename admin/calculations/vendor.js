const { Vendors, Languages, Industries } = require('../models');

const getFittingVendor = async (stepData) => {
  stepData.sourceLanguage = await Languages.findOne({ symbol: stepData.sourceLanguage });
  stepData.targetLanguage = await Languages.findOne({ symbol: stepData.targetLanguage });
  stepData.industry = typeof stepData.industry === 'string' ? await Industries.findOne({ name: stepData.industry })
    : stepData.industry._id;
  const vendors = await Vendors.find();
  const fittingVendors = findFittingVendor(stepData, vendors);
  if (fittingVendors.length === 1) {
    return fittingVendors[0];
  }
  return null;
};

const findFittingVendor = (stepData, vendors, fromFront = false) => {
  const { sourceLanguage, targetLanguage, step, industry } = stepData;
  const fittingVendors = [];
  for (let vendor of vendors) {
    const { _id, qualifications } = vendor;
    if (qualifications.length) {
      for (let { source, target, steps, industry: vendorIndustry, status } of qualifications) {
        source = fromFront ? source._id : source;
        target = fromFront ? target._id : target;
        vendorIndustry = fromFront ? vendorIndustry._id : vendorIndustry;
        steps = steps.map(item => fromFront ? item._id : item);
        if (steps.includes(step) && source.toString() === sourceLanguage._id.toString() &&
          target.toString() === targetLanguage._id.toString() && vendorIndustry.toString() === industry.toString() &&
          status === 'Passed') {
          fittingVendors.push(fromFront ? vendor : _id);
        }
      }
    }
  }
  return fittingVendors;
};

const checkIsSameVendor = (steps) => {
  if (steps.length === 2) {
    if (steps[0].vendor && steps[1].vendor && steps[0].vendor.toString() === steps[1].vendor.toString()) {
      steps[1].vendor = null;
      steps[1].vendorRate = ''
      steps[1].finance.Price.payables = 0;
      return steps;
    }
  }
  return steps;
}


module.exports = { getFittingVendor, checkIsSameVendor, findFittingVendor }
