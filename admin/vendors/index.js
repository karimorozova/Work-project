const { getVendor, getVendors, getVendorAfterUpdate } = require("./getVendors");
const { updateVendorRates, deleteRate, importRates, getVendorAfterCombinationsUpdated } = require("./vendorRates");
const { saveHashedPassword } = require("./info");
const { getJobs, updateStepProp } = require("./jobs");
const { manageNewApplication } = require("./application");

module.exports = {
    getVendor,
    getVendors,
    getVendorAfterUpdate,
    updateVendorRates,
    deleteRate,
    importRates,
    saveHashedPassword,
    getJobs, 
    updateStepProp,
    getVendorAfterCombinationsUpdated,
    manageNewApplication
}