const { Vendors } = require("../models");
const { getFilteringQuery } = require("./filter");

async function getVendor(query) {
    const vendor = await Vendors.findOne(query)
            .populate("native")
            .populate("industries")
            .populate("languagePairs.source")
            .populate("languagePairs.target")
            .populate("qualifications.source")
            .populate("qualifications.target")
            .populate("qualifications.industry")
            .populate("qualifications.steps")
            .populate("assessments.step")
            .populate("assessments.langsData.source")
            .populate("assessments.langsData.target")
            .populate("assessments.langsData.industries.industry")
            .populate('competencies.sourceLanguage')
            .populate('competencies.targetLanguage')
            .populate('competencies.industry')
            .populate('competencies.step')
            .populate('rates.basicPricesTable.sourceLanguage')
            .populate('rates.basicPricesTable.targetLanguage')
            .populate('rates.stepMultipliersTable.step')
            .populate('rates.stepMultipliersTable.unit')
            .populate('rates.industryMultipliersTable.industry');
    return vendor;
}

async function getVendors(query) {
    const vendors = await Vendors.find(query)
            .populate("native")
            .populate("industries")
            .populate("languagePairs.source")
            .populate("languagePairs.target")
            .populate("qualifications.source")
            .populate("qualifications.target")
            .populate("qualifications.industry")
            .populate("qualifications.steps")
            .populate("assessments.step")
            .populate("assessments.langsData.source")
            .populate("assessments.langsData.target")
            .populate("assessments.langsData.industries.industry")
            .populate('competencies.sourceLanguage')
            .populate('competencies.targetLanguage')
            .populate('competencies.industry')
            .populate('competencies.step');
    return vendors;
}

async function getVendorAfterUpdate(query, update) {
    return await Vendors.findOneAndUpdate(query, update, {new: true})
            .populate("native")
            .populate("industries")
            .populate("languagePairs.source")
            .populate("languagePairs.target")
            .populate("qualifications.source")
            .populate("qualifications.target")
            .populate("qualifications.industry")
            .populate("qualifications.steps")
            .populate("assessments.step")
            .populate("assessments.langsData.source")
            .populate("assessments.langsData.target")
            .populate("assessments.langsData.industries.industry")
            .populate('competencies.sourceLanguage')
            .populate('competencies.targetLanguage')
            .populate('competencies.industry')
            .populate('competencies.step');
}

async function getFilteredVendors(filters) {
    try {
        const query = getFilteringQuery(filters);
        const vendors = await Vendors.aggregate([
            {$addFields: {"name" : {$concat : [ "$firstName", " ", "$surname" ]}}},
            {$match: query},
        ]).sort({_id: 1}).limit(25)

        return Vendors.populate(vendors, [
            "native",
            "industries",
            "languagePairs.source",
            "languagePairs.target",
            "qualifications.source",
            "qualifications.target",
            "qualifications.industry",
            "qualifications.steps",
            "assessments.step",
            "assessments.langsData.source",
            "assessments.langsData.target",
            "assessments.langsData.industries.industry",
        ]);
    } catch(err) {
        console.log(err);
        console.log("Error on filtering vendors");
    }
}

module.exports = { getVendor, getVendors, getVendorAfterUpdate, getFilteredVendors }
