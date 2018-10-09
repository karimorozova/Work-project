const { Vendors } = require("../../models/");

async function getVendor(obj) {
    const vendor = await Vendors.findOne(obj)
            .populate('native')
            .populate('languageCombinations.source')
            .populate('languageCombinations.target')
            .populate('languageCombinations.service')
            .populate('languageCombinations.industry.industry')
            .populate('industry')
            .populate('languagePairs.source')
            .populate('languagePairs.target')
    return vendor;
}

async function getVendors(obj) {
    const vendors = await Vendors.find(obj)
            .populate('native')
            .populate('languageCombinations.source')
            .populate('languageCombinations.target')
            .populate('languageCombinations.service')
            .populate('languageCombinations.industry.industry')
            .populate('industry')
            .populate('languagePairs.source')
            .populate('languagePairs.target')
    return vendors;
}

module.exports = { getVendor, getVendors }