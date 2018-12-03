const { Vendors } = require("../../models/");

async function getVendor(obj) {
    const vendor = await Vendors.findOne(obj)
            .populate('native')
            .populate('languageCombinations.source')
            .populate('languageCombinations.target')
            .populate('languageCombinations.industries.industry')
            .populate('industries')
            .populate('languagePairs.source')
            .populate('languagePairs.target')
    return vendor;
}

async function getVendors(obj) {
    const vendors = await Vendors.find(obj)
            .populate('native')
            .populate('languageCombinations.source')
            .populate('languageCombinations.target')
            .populate('languageCombinations.industries.industry')
            .populate('industries')
            .populate('languagePairs.source')
            .populate('languagePairs.target')
    return vendors;
}

async function getVendorAfterUpdate(query, update) {
    return await Vendors.findOneAndUpdate(query, update, {new: true})
            .populate('native')
            .populate('languageCombinations.source')
            .populate('languageCombinations.target')
            .populate('languageCombinations.industries.industry')
            .populate('industries')
            .populate('languagePairs.source')
            .populate('languagePairs.target')
}

module.exports = { getVendor, getVendors, getVendorAfterUpdate }