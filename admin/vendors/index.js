const {
	getVendor,
	getVendors,
	getVendorAfterUpdate,
	getFilteredVendors,
	hasVendorCompetenciesAndPending,
	getFilteredVendorsPotential,
	getVendorForPortal,
	getVendorExtraForPortal
} = require('./getVendors')

const {
	saveVendorDocument,
	saveVendorDocumentDefault,
	removeVendorDoc,
	saveHashedPassword,
	getPhotoLink,
	removeOldVendorFile,
	updateVendorEducation,
	removeVendorEdu,
	updateVendorAssessment,
	saveNotPassedTest,
	managePaymentMethods
} = require('./info')

const {
	// getJobs,
	getJobDetails,
	updateStepProp
} = require('./jobs')

const { manageNewApplication } = require('./application')
const { notifyTestStatus, sendMessageToVendor } = require('./emails')
const {
	updateVendorCompetencies,
	deleteVendorCompetencies,
	generateCompetenciesCombinations
} = require('./competencies')

const { updateVendorMatrix, syncVendorMatrix } = require('./vendorMatrix')
const { saveQualifications, saveQualificationsAfterUpdateCompetencies } = require('./qualifications')
const { updateVendorsRatePrices, getVendorAfterCombinationsUpdated } = require('./updateVendorRates')
const { syncVendorRatesCost } = require('./syncVendorRatesCost')
const { createRateRowFromQualification, updateVendorRatesFromSettings } = require('./createVendorRates')
const { getVendorAssessmentsWordCount } = require('./getVendorAssessments')

const {
	getFilteredVendorsPendingCompetencies,
	extendVendorsPendingCompetencies,
	approvePendingCompetence,
	setRatePriceAfterPassedTest,
	sendVendorTestAndUpdateQualification,
	rejectedPendingCompetence,
	deletePendingCompetence
} = require('./pendingCompetencies')

const {
	createVendor
} = require("./createVendor")

const {
	getVendorAvailability,
	updateVendorAvailability
} = require("./availability")

const {
	getVendorSocialMedia,
	updateVendorSocialMediaValue
} = require("./socialMediaAndCommunication")

module.exports = {
	getVendorSocialMedia,
	updateVendorSocialMediaValue,
	updateVendorAvailability,
	getVendorAvailability,
	getJobDetails,
	getVendorExtraForPortal,
	getVendorForPortal,
	createVendor,
	managePaymentMethods,
	getVendor,
	getVendors,
	getVendorAfterUpdate,
	getFilteredVendors,
	saveVendorDocument,
	saveVendorDocumentDefault,
	removeVendorDoc,
	saveHashedPassword,
	getPhotoLink,
	removeOldVendorFile,
	updateStepProp,
	manageNewApplication,
	updateVendorEducation,
	removeVendorEdu,
	updateVendorAssessment,
	notifyTestStatus,
	sendMessageToVendor,
	updateVendorCompetencies,
	deleteVendorCompetencies,
	saveQualifications,
	updateVendorsRatePrices,
	syncVendorRatesCost,
	createRateRowFromQualification,
	generateCompetenciesCombinations,
	saveQualificationsAfterUpdateCompetencies,
	getVendorAfterCombinationsUpdated,
	getVendorAssessmentsWordCount,
	updateVendorMatrix,
	syncVendorMatrix,
	getFilteredVendorsPendingCompetencies,
	extendVendorsPendingCompetencies,
	approvePendingCompetence,
	setRatePriceAfterPassedTest,
	sendVendorTestAndUpdateQualification,
	hasVendorCompetenciesAndPending,
	rejectedPendingCompetence,
	deletePendingCompetence,
	getFilteredVendorsPotential,
	saveNotPassedTest,
	updateVendorRatesFromSettings
}
