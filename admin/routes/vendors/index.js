const { getVendor, getVendors, getVendorAfterUpdate } = require("./getVendors");
const { getVendorRates, updateVendorRates, deleteRate, addSeveralCombinations } = require("./vendorRates");
const { saveHashedPassword } = require("./info");

const vendors = {
    getVendor,
    getVendors,
    getVendorRates,
    getVendorAfterUpdate,
    updateVendorRates,
    deleteRate,
    addSeveralCombinations,
    saveHashedPassword
}

module.exports = vendors;