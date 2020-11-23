const { Vendors, Languages, Industries } = require('../models');

const getFittingVendor = async (stepData) => {
	stepData.sourceLanguage = await Languages.findOne({ symbol: stepData.sourceLanguage });
	stepData.targetLanguage = await Languages.findOne({ symbol: stepData.targetLanguage });
	stepData.industry = typeof stepData.industry === 'string' ? await Industries.findOne({ name: stepData.industry })
			: stepData.industry._id;
	const vendors = await Vendors.find({ status: 'Active' });
	const fittingVendors = findFittingVendor(stepData, vendors);
	if(fittingVendors.length === 1) {
		return fittingVendors[0];
	}
	return null;
};

const findFittingVendor = (stepData, vendors, fromFront = false) => {

	const { sourceLanguage, targetLanguage, step, industry } = stepData;
	const fittingVendors = [];
	for (let vendor of vendors) {
		//FROM RATES
		const { rates } = vendor;
		if(rates.hasOwnProperty('pricelistTable')) {
			const { pricelistTable } = rates;
			if(pricelistTable.length) {
				for (let rate of pricelistTable) {
					const sourceRate = fromFront ? rate.sourceLanguage._id : rate.sourceLanguage;
					const targetRate = fromFront ? rate.targetLanguage._id : rate.targetLanguage;
					const industryRate = fromFront ? rate.industry._id : rate.industry;
					const stepRate = fromFront ? rate.step._id : rate.step;
					if(
							sourceRate.toString() === sourceLanguage._id.toString() &&
							targetRate.toString() === targetLanguage._id.toString() &&
							industryRate.toString() === industry.toString() &&
							stepRate.toString() === step.toString()
					) {
						if(!fittingVendors.map(i => i._id).includes(vendor._id)){
							fittingVendors.push(fromFront ? vendor : vendor._id);
						}
					}
				}
			}
		}
		//FROM COMPLETED TEST
		// const { _id, qualifications } = vendor;
		// if (qualifications.length) {
		//   for (let { source, target, steps, industries: vendorIndustries, status } of qualifications) {
		//     source = fromFront ? source._id : source;
		//     target = fromFront ? target._id : target;
		//     vendorIndustries = vendorIndustries.map(item => fromFront ? item._id : item);
		//     steps = steps.map(item => fromFront ? item._id : item);
		//     if (steps.includes(step) && source.toString() === sourceLanguage._id.toString() &&
		//       target.toString() === targetLanguage._id.toString() && vendorIndustries.includes(industry) &&
		//       status === 'Passed') {
		//       fittingVendors.push(fromFront ? vendor : _id);
		//     }
		//   }
		// }
	}
	return fittingVendors;
};

const checkIsSameVendor = (steps) => {
	if(steps.length === 2) {
		if(steps[0].vendor && steps[1].vendor && steps[0].vendor.toString() === steps[1].vendor.toString()) {
			steps[1].vendor = null;
			steps[1].vendorRate = "";
			steps[1].finance.Price.payables = 0;
			return steps;
		}
	}
	return steps;
}


module.exports = { getFittingVendor, checkIsSameVendor, findFittingVendor }
