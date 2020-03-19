const { getVendor, getVendors, getVendorAfterUpdate, getFilteredVendors } = require("./getVendors");
const { updateVendorRates, deleteRate, importRates, getVendorAfterCombinationsUpdated } = require("./vendorRates");
const { saveVendorDocument, removeVendorDoc, saveHashedPassword, getPhotoLink, removeOldVendorFile } = require("./info");
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
    removeVendorDoc,
    saveHashedPassword,
    getPhotoLink,
    removeOldVendorFile,
    getJobs, 
    updateStepProp,
    getVendorAfterCombinationsUpdated,
    manageNewApplication
}