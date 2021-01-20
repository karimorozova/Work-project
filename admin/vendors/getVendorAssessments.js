const { XtrfLqaGrouped, Vendors } = require("../models");
const {canNextLQAStep} = require("../reports/helpers")

const getVendorReportWordcount = async (vendorId) => {
	const assessments = await Vendors.findOne({ _id: vendorId });
	let allReports = await XtrfLqaGrouped.findOne({languagePair})
	// return allReports.map();

	// return assessments
	// const assessmentLangPair = industries.find(({industryGroup}) => industryGroup === industry)
	// if (!assessmentLangPair) return 0
	// const assessmentIndustry = assessmentLangPair.vendors.find(({vendor})=> vendor === vendorId)
	// return assessmentIndustry.wordCount;
}

// const getVendorReportWordcount = (languagePair, industry, vendorId, nextStep) => {
//  const wordCount = getVendorWordCount(languagePair, industry, vendorId)
// 	return canNextLQAStep(wordCount, nextStep, 1)


module.exports = { getVendorReportWordcount }
