const { getVendor, getVendors, getVendorAfterUpdate, getFilteredVendors } = require("./getVendors");
const { updateVendorRates, deleteRate, importRates, getVendorAfterCombinationsUpdated } = require("./vendorRates");
const { saveVendorDocument, saveVendorDocumentDefault, removeVendorDoc, saveHashedPassword, getPhotoLink, 
    removeOldVendorFile, updateVendorEducation, removeVendorEdu, updateVendorAssessment} = require("./info");
const { getJobs, updateStepProp } = require("./jobs");
const { manageNewApplication } = require("./application");

module.exports = {
    getVendor,
    getVendors,
    getVendorAfterUpdate,
    getFilteredVendors,
    updateVendorRates,
    deleteRate,
    importRates,
    saveVendorDocument,
    saveVendorDocumentDefault,
    removeVendorDoc,
    saveHashedPassword,
    getPhotoLink,
    removeOldVendorFile,
    getJobs, 
    updateStepProp,
    getVendorAfterCombinationsUpdated,
    manageNewApplication,
    updateVendorEducation,
    removeVendorEdu,
    updateVendorAssessment
}