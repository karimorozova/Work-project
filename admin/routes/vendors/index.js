const { getVendor, getVendors } = require("./getVendors");
const { checkRatesMatch, deleteRate } = require("./vendorRates");

const vendors = {
    getVendor,
    getVendors,
    checkRatesMatch,
    deleteRate
}

module.exports = vendors;