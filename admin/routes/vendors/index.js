const { getVendor, getVendors, getVendorAfterUpdate } = require("./getVendors");
const { getVendorRates, updateVendorRates, deleteRate, addVendorsSeveralLangs } = require("./vendorRates");

const vendors = {
    getVendor,
    getVendors,
    getVendorRates,
    getVendorAfterUpdate,
    updateVendorRates,
    deleteRate,
    addVendorsSeveralLangs
}

module.exports = vendors;