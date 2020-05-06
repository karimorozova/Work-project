const { MemoqProject } = require('../../models');

async function getFilteredOtherProjects(filters) {
  try {
    const projects = await MemoqProject.find();
    return projects;
  } catch (err) {
    console.log(err.message);
    console.log('Error in getFilteredOtherProjects');
    throw new Error(err.message);
  }
}

module.exports = {
  getFilteredOtherProjects,
}
