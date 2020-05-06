const { MemoqProject } = require('../../models');

function getFilteredProjectQuery(filters) {
  let query = {};
  if (filters.clientFilter) {
    query.client = { '$regex': new RegExp(`${filters.clientFilter}`, 'i') };
  }
  if (filters.startFilter) {
    query.creationTime = { $gte: new Date(filters.startFilter) };
  }
  if (filters.deadlineFilter) {
    query.deadline = { $lte: new Date(filters.deadlineFilter) };
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
    const filteredProjects = await getFilteredProjectQuery(filters);
    return MemoqProject.find(filteredProjects);
  } catch (err) {
    console.log(err.message);
    console.log('Error in getFilteredOtherProjects');
    throw new Error(err.message);
  }
}

module.exports = {
  getFilteredOtherProjects,
}
