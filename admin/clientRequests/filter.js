const ObjectId = require('mongodb').ObjectID;

function getFilterdRequestsQuery(filters) {
    let query = {}
    if(filters.lastDate) {
        query.startDate = {$lt: new Date(filters.lastDate)};
    }
    if(filters.startFilter) {
        query.startDate = filters.lastDate ? {$lt: new Date(filters.lastDate), $gte: new Date(filters.startFilter)} : {$gte: new Date(filters.startFilter)};
    }
    if(filters.deadlineFilter) {
        query.deadline = {$lte: new Date(filters.deadlineFilter)};
    }
    if(filters.clientFilter) {
        query["customer.name"] = {"$regex": new RegExp(`${filters.clientFilter}`, 'i')};
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