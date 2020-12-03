const ObjectId = require('mongodb').ObjectID;

/**
 *
 * @param {Object} filters
 * @returns {Object} - returns a query for mongo search
 */
function getClientsFilteringQuery(filters) {
  const { statusFilter, industryFilter, leadSourceFilter, nameFilter, lastId } = filters;
  let query = {};
  if(statusFilter !== 'All') {
    query.status = statusFilter;
  }
  if (lastId) {
    query._id = { $gt: ObjectId(filters.lastId) }
  }
  if (industryFilter && industryFilter.name !== 'All') {
    query.industries = industryFilter._id;
  }
  if (nameFilter) {
    query.name = { "$regex": new RegExp(`${nameFilter}`, 'i') };
  }
  if (leadSourceFilter && leadSourceFilter !== 'All') {
    query.leadSource = leadSourceFilter;
  }
  return query;
}

module.exports = { getClientsFilteringQuery }
