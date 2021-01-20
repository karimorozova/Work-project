const { XtrfLqaGrouped } = require("../models");
const {canNextLQAStep} = require("../reports/helpers")

const getVendorWordCount = (languagePair, industry, vendorId) => {
	const XtrfsLqa = XtrfLqaGrouped.findOne({languagePair})
	const assessmentLangPair = XtrfsLqa.industries.find(({industryGroup}) => industryGroup === industry)
	if (!assessmentLangPair) return 0
	const assessmentIndustry = assessmentLangPair.vendors.find(({vendor})=> vendor === vendorId)
	return assessmentIndustry.wordCount;
}

const canUpdateAssessment = (languagePair, industry, vendorId, nextStep) => {
 const wordCount = getVendorWordCount(languagePair, industry, vendorId)
	return canNextLQAStep(wordCount, nextStep, 1)
}

module.exports = { canUpdateAssessment }