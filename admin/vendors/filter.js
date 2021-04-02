const ObjectId = require('mongodb').ObjectID;
const moment = require('moment')

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
    // if(sourceFilter) {
    //     query["wordsRates.source"] = sourceFilter;
    // }
    // if(targetFilter) {
    //     query["wordsRates.target"] = targetFilter;
    // }
    if(nameFilter) {
        query["firstName"] = {"$regex": new RegExp(`${nameFilter}`, 'i')};
    }
    // if(stepFilter) {
    //     query["$or"] = [
    //         {[`wordsRates.rates.${stepFilter}.active`]: true},
    //         {[`hoursRates.rates.${stepFilter}.active`]: true},
    //         {[`monoRates.rates.${stepFilter}.active`]: true},
    //     ]
    // }
    return query;
}

function getFilteringQueryPotential(filters) {

    const { status, industries, nameFilter, dateRange } = getFiltersPotential(filters);
    let query = {
        status
    }
    if(filters.lastId) {
        query["_id"] = {$gt: ObjectId(filters.lastId)}
    }
    if(industries) {
        query.industries = ObjectId(industries);
    }
    if(nameFilter) {
        query["firstName"] = {"$regex": new RegExp(`${nameFilter}`, 'i')};
    }
    if(!!dateRange){
        const {from, to} = dateRange;
        query["dateInfo.createdAt"] = { $gte: moment(from).format("YYYY MM DD"),  $lte : moment(to).format("YYYY MM DD") }
    }
    return query;

    function getFiltersPotential(filters){
        const status = filters.statusFilter !== 'All' ? filters.statusFilter : {$ne: ""};
        const nameFilter = filters.nameFilter;
        const industries = filters.industryFilter.name !== 'All' ? filters.industryFilter._id : "";
        return { dateRange: filters.dateRange,  status, nameFilter, industries}
    }
}


function getFilters(filters) {
    const status = filters.statusFilter !== 'All' ? filters.statusFilter : {$ne: ""};
    const industries = filters.industryFilter.name !== 'All' ? filters.industryFilter._id : "";
    const sourceFilter = filters.sourceFilter[0] ? {$in: filters.sourceFilter.map(item => ObjectId(item))}: "";
    const targetFilter = filters.targetFilter[0] ? {$in: filters.targetFilter.map(item => ObjectId(item))}: "";
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

module.exports = { getFilteringQuery, getFilteringQueryPotential }