const { XtrfLqaGrouped, Vendors } = require("../models");
const {canNextLQAStep} = require("../reports/helpers")

const getVendorAssessmentsWordCount = async (vendorId) => {
	const { assessments } = await Vendors.findOne({ _id: vendorId })
			.populate('assessments.sourceLanguage', 'lang' )
			.populate('assessments.targetLanguage', 'lang')
			.populate('assessments.industries.industry', ['name'])

	const allReports = await XtrfLqaGrouped.find({},{'industries.vendors.otherInfo': 0})

	return assessments.reduce((wordCountAssessments, { sourceLanguage, targetLanguage, industries }) => {
		const langPair = sourceLanguage.lang + ' >> ' + targetLanguage.lang

		industries.forEach(({industry}) => {
			const assessmentWordCount = getAssessmentWordCount(allReports ,langPair, industry._id, vendorId)

			if (!assessmentWordCount) return wordCountAssessments
			wordCountAssessments.push({langPair,industry: industry.name, wordCount: assessmentWordCount})

			return wordCountAssessments
		})
		return wordCountAssessments
	},[])
}
function getAssessmentWordCount(xtrfReports,langPair, industry, vendorId) {
	const assessmentLangPair = xtrfReports.find(report => report.languagePair === langPair)
	if (!assessmentLangPair) return 0
	const assessmentIndustry = assessmentLangPair.industries.find(({industryGroup}) => industryGroup._id.toString() === industry.toString())
	if (!assessmentIndustry) return 0
	const assessmentVendor = assessmentIndustry.vendors.find(({vendor}) => vendor.toString() === vendorId)
	return assessmentVendor ? Math.round(assessmentVendor.wordCount) : 0;
}


module.exports = { getVendorAssessmentsWordCount }
