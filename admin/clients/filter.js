const ObjectId = require('mongodb').ObjectID;

function getClientsFilteringQuery(filters) {
    const { statusFilter, industryFilter, leadsourceFilter, nameFilter, lastId } = filters;
    let query = {};
    if(statusFilter !== 'All') {
        query.status = statusFilter;
    }
    if(lastId) {
        query._id = {$gt: ObjectId(filters.lastId)}
    }
    if(industryFilter && industryFilter.name !== 'All') {
        query.industries = industryFilter._id;
    }
    if(nameFilter) {
       query.name = {"$regex": new RegExp(`${nameFilter}`, 'i')};
    }
    if(leadsourceFilter && leadsourceFilter !== 'All') {
        query.leadSource = leadsourceFilter;
    }
    return query;
}

module.exports = { getClientsFilteringQuery }