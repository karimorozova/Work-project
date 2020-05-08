const { MemoqProject } = require('../../models');

function getFilteredProjectQuery(filters) {
  let query = {};
  if(filters.lastDate) {
    query.creationTime = {$lt: new Date(filters.lastDate)};
  }
  if (filters.clientFilter) {
    query.client = { '$regex': new RegExp(`${filters.clientFilter}`, 'i') };
  }
  if (filters.startFilter) {
    query.creationTime = filters.lastDate ? {$lt: new Date(filters.lastDate), $gte: new Date(filters.startFilter)} : {$gte: new Date(filters.startFilter)};
  }
  if (filters.deadlineFilter) {
    query.deadline = { $lte: new Date(filters.deadlineFilter) };
  }
  if (filters.pmFilter) {
    query.users = {
      '$elemMatch': {
        'User.FullName': {
          '$regex': new RegExp(`${filters.pmFilter}`, 'i')
        },
        'ProjectRoles.isPm': true,
      }
    }
  }
  if (filters.sourceFilter && filters.sourceFilter.length) {
    query['sourceLanguage.symbol'] = { '$in': filters.sourceFilter }
  }
  if (filters.targetFilter && filters.targetFilter.length) {
    query['targetLanguages.symbol'] = { '$in': filters.targetFilter }
  }
  return query;
}

async function getFilteredOtherProjects(filters) {
  try {
    const filteredProjects = getFilteredProjectQuery(filters);
    return await MemoqProject.find(filteredProjects).sort({ creationTime: -1 }).limit(25);
  } catch (err) {
    console.log(err.message);
    console.log('Error in getFilteredOtherProjects');
    throw new Error(err.message);
  }
}

module.exports = {
  getFilteredOtherProjects,
}
