const {
	getVendor,
	getVendors,
	getVendorAfterUpdate,
	getFilteredVendors,
	getFilteredVendorsWithCustomFilters,
	hasVendorCompetenciesAndPending,
	getFilteredVendorsPotential
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
	saveNotPassedTest
} = require('./info')

const { getJobs, updateStepProp } = require('./jobs')
const { manageNewApplication } = require('./application')
const { notifyTestStatus, sendMessageToVendor } = require('./emails')
const {
	updateVendorCompetencies,
	deleteVendorCompetencies,
	generateCompetenciesCombinations,
} = require('./competencies')

const { updateVendorMatrix, syncVendorMatrix } = require('./vendorMatrix')
const { saveQualifications, saveQualificationsAfterUpdateCompetencies } = require('./qualifications')
const { updateVendorsRatePrices, getVendorAfterCombinationsUpdated } = require('./updateVendorRates')
const { syncVendorRatesCost } = require('./syncVendorRatesCost')
const { createRateRowFromQualification, updateClientRatesFromSettings } = require('./createVendorRates')
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

module.exports = {
	getVendor,
	getVendors,
	getVendorAfterUpdate,
	getFilteredVendors,
  getFilteredVendorsWithCustomFilters,
	saveVendorDocument,
	saveVendorDocumentDefault,
	removeVendorDoc,
	saveHashedPassword,
	getPhotoLink,
	removeOldVendorFile,
	getJobs,
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
	updateClientRatesFromSettings
}
