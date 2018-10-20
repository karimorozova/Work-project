const { getVendor, getVendors } = require("./getVendors");
const { checkRatesMatch, deleteRate, addVendorsSeveralLangs } = require("./vendorRates");

const vendors = {
    getVendor,
    getVendors,
    checkRatesMatch,
    deleteRate,
    addVendorsSeveralLangs
}

module.exports = vendors;