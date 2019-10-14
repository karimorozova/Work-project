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
        query.industries = industries;
    }
    if(sourceFilter) {
        query["wordsRates.source"] = sourceFilter;
    }
    if(targetFilter) {
        query["wordsRates.target"] = targetFilter;
    }
    if(nameFilter || stepFilter) {
        query["$and"] = getCombinedFilters({nameFilter, stepFilter, query});
    }
    return query;
}

function getCombinedFilters({nameFilter, stepFilter}) {
    const nameFilterQuery = getNameFilterQuery(nameFilter);
    const stepFiltersQuery = getStepFiltersQuery(stepFilter);
    return [
        {"$or": nameFilterQuery},
        {"$or": stepFiltersQuery}
    ]
}

function getNameFilterQuery(nameFilter) {
    if(nameFilter) {
        return [
            {"firstName": {$in: nameFilter.map(item => new RegExp(`${item}`, 'i'))}},
            {"surname": {$in: nameFilter.map(item => new RegExp(`${item}`, 'i'))}}
        ]
    } else {
        return [
            {"firstName": {$exists: true}},
            {"surname": {$exists: true}}
        ]
    }
}

function getStepFiltersQuery(stepFilter) {
    if(stepFilter) {
        return [
            {[`wordsRates.rates.${stepFilter}.active`]: true},
            {[`hoursRates.rates.${stepFilter}.active`]: true},
            {[`monoRates.rates.${stepFilter}.active`]: true},
        ]
    } else {
        return [
            {"_id": {$exists: true}}
        ]
    }
}

function getFilters(filters) {
    const status = filters.statusFilter !== 'All' ? filters.statusFilter : {$ne: ""};
    const industries = filters.industryFilter.name !== 'All' ? filters.industryFilter._id : "";
    const sourceFilter = filters.sourceFilter[0] ? {$in: filters.sourceFilter}: "";
    const targetFilter = filters.targetFilter[0] ? {$in: filters.targetFilter}: "";
    const stepFilter = filters.stepFilter.title !== 'All' ? filters.stepFilter._id : "";
    const nameFilter = filters.nameFilter.trim() ? filters.nameFilter.split(" ") : "";
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