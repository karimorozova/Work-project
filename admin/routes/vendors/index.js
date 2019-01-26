const { getVendor, getVendors, getVendorAfterUpdate } = require("./getVendors");
const { getVendorRates, updateVendorRates, deleteRate, addSeveralCombinations } = require("./vendorRates");

const vendors = {
    getVendor,
    getVendors,
    getVendorRates,
    getVendorAfterUpdate,
    updateVendorRates,
    deleteRate,
    addSeveralCombinations
}

module.exports = vendors;