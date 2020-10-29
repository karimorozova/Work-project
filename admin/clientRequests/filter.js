const ObjectId = require('mongodb').ObjectID;

function getFilteredRequestsQuery (filters) {
  let query = {};
  if (filters.lastDate) {
    query.startDate = { $lt: new Date(filters.lastDate) };
  }
  if (filters.startFilter) {
    query.startDate = filters.lastDate ? {
      $lt: new Date(filters.lastDate),
      $gte: new Date(filters.startFilter)
    } : { $gte: new Date(filters.startFilter) };
  }
  if (filters.deadlineFilter) {
    query.deadline = { $lte: new Date(filters.deadlineFilter) };
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
    if(filters.pmIds) {
      const managerFilter = filters.pmIds.map(item => ObjectId(item._id));
      query.projectManager = { $in: managerFilter };
    }
  if (filters.salesIds) {
    const managerFilter = filters.salesIds.map(item => ObjectId(item._id));
    query.salesManager = { $in: managerFilter };
  }
  return query;
}

module.exports = { getFilteredRequestsQuery };
