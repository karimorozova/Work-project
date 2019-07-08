const { getVendor, getVendors, getVendorAfterUpdate } = require("./getVendors");
const { getVendorRates, updateVendorRates, deleteRate, addSeveralCombinations, getVendorAfterCombinationsUpdated } = require("./vendorRates");
const { saveHashedPassword } = require("./info");
const { getJobs, updateStepProp } = require("./jobs");

module.exports = {
    getVendor,
    getVendors,
    getVendorRates,
    getVendorAfterUpdate,
    updateVendorRates,
    deleteRate,
    addSeveralCombinations,
    saveHashedPassword,
    getJobs, 
    updateStepProp,
    getVendorAfterCombinationsUpdated
}