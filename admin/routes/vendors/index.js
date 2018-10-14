const { getVendor, getVendors } = require("./getVendors");
const { checkRates, deleteRate } = require("./vendorRates");

const vendors = {
    getVendor,
    getVendors,
    checkRates,
    deleteRate
}

module.exports = vendors;