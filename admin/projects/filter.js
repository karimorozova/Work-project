const ObjectId = require('mongodb').ObjectID;

function getFilterdProjectsQuery(filters) {
    const status = !filters.statusFilter || filters.statusFilter === 'All' ? {$ne: ""} : filters.statusFilter;
    let query = {
        status
    }
    if(filters.lastDate) {
        query.startDate = {$lt: filters.lastDate};
    }
    if(filters.startFilter) {
        query.startDate = filters.lastDate ? {$lt: filters.lastDate, $gte: filters.startFilter} : {$gte: filters.startFilter};
    }
    if(filters.deadlineFilter) {
        query.deadline = {$lte: filters.deadlineFilter};
    }
    if(filters.clientFilter) {
        query.companyName = {"$regex": new RegExp(`${clientFilter}`, 'i')};
    }
    if(filters.sourceFilter && filters.sourceFilter.length) {
        query["tasks.sourceLanguage"] = {$in: filters.sourceFilter};
    }
    if(filters.targetFilter && filters.targetFilter.length) {
        query["tasks.targetLanguage"] = {$in: filters.targetFilter};
    }
    if(filters.managersIds) {
        const managerFilter = filters.managersIds.map(item => ObjectId(item._id));
        query.projectManager = {$in: managerFilter};
    }
    return query;
}

module.exports = { getFilterdProjectsQuery }