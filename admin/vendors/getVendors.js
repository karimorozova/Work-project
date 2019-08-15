const { Vendors } = require("../models");

async function getVendor(obj) {
    const vendor = await Vendors.findOne(obj)
            .populate('native')
            .populate('industries')
            .populate("wordsRates.source")
            .populate("wordsRates.target")
            .populate("wordsRates.industries")
            .populate("hoursRates.source")
            .populate("hoursRates.target")
            .populate("hoursRates.industries")
            .populate("monoRates.target")
            .populate("monoRates.industries")
            .populate('languagePairs.source')
            .populate('languagePairs.target')
    return vendor;
}

async function getVendors(obj) {
    const vendors = await Vendors.find(obj)
            .populate('native')
            .populate('industries')
            .populate("wordsRates.source")
            .populate("wordsRates.target")
            .populate("wordsRates.industries")
            .populate("hoursRates.source")
            .populate("hoursRates.target")
            .populate("hoursRates.industries")
            .populate("monoRates.target")
            .populate("monoRates.industries")
            .populate('languagePairs.source')
            .populate('languagePairs.target')
    return vendors;
}

async function getVendorAfterUpdate(query, update) {
    return await Vendors.findOneAndUpdate(query, update, {new: true})
            .populate('native')
            .populate('industries')
            .populate("wordsRates.source")
            .populate("wordsRates.target")
            .populate("wordsRates.industries")
            .populate("hoursRates.source")
            .populate("hoursRates.target")
            .populate("hoursRates.industries")
            .populate("monoRates.target")
            .populate("monoRates.industries")
            .populate('languagePairs.source')
            .populate('languagePairs.target')
}

module.exports = { getVendor, getVendors, getVendorAfterUpdate }