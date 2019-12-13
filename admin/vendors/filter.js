const ObjectId = require('mongodb').ObjectID;

function getFilteringQuery(filters) {
    const { status, industries, sourceFilter, targetFilter, stepFilter, nameFilter } = getFilters(filters);
    let query = {
        status
    }
    if(filters.lastId) {
        query["_id"] = {$gt: ObjectId(filters.lastId)}
    }
    if(industries) {
        query.industries = ObjectId(industries);
    }
    if(sourceFilter) {
        query["wordsRates.source"] = sourceFilter;
    }
    if(targetFilter) {
        query["wordsRates.target"] = targetFilter;
    }
    if(nameFilter) {
        query["name"] = {"$regex": new RegExp(`${nameFilter}`, 'i')};
    }
    if(stepFilter) {
        query["$or"] = [
            {[`wordsRates.rates.${stepFilter}.active`]: true},
            {[`hoursRates.rates.${stepFilter}.active`]: true},
            {[`monoRates.rates.${stepFilter}.active`]: true},
        ]
    }
    return query;
}

function getFilters(filters) {
    const status = filters.statusFilter !== 'All' ? filters.statusFilter : {$ne: ""};
    const industries = filters.industryFilter.name !== 'All' ? filters.industryFilter._id : "";
    const sourceFilter = filters.sourceFilter[0] ? {$in: filters.sourceFilter}: "";
    const targetFilter = filters.targetFilter[0] ? {$in: filters.targetFilter}: "";
    const stepFilter = filters.stepFilter.title !== 'All' ? filters.stepFilter._id : "";
    const nameFilter = filters.nameFilter;
    return {
        status,
        industries,
        sourceFilter,
        targetFilter,
        stepFilter,
        nameFilter
    }
}

module.exports = { getFilteringQuery }