const ObjectId = require('mongodb').ObjectID;

function getFilterdRequestsQuery(filters) {
    let query = {}
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
        query["sourceLanguage.symbol"] = {$in: filters.sourceFilter};
    }
    if(filters.targetFilter && filters.targetFilter.length) {
        query["targetLanguages.symbol"] = {$in: filters.targetFilter};
    }
    if(filters.managersIds) {
        const managerFilter = filters.managersIds.map(item => ObjectId(item._id));
        query.projectManager = {$in: managerFilter};
    }
    return query;
}

module.exports = { getFilterdRequestsQuery }