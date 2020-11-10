const { MemoqProject, Clients, Vendors } = require('../../../models');
const { checkProjectStructure, getProjectStatus } = require('./helpers');
const { createOtherProjectFinanceData } = require('./financeData');
const { getMemoqProjects } = require('./getMemoqProject');

const updateAllMemoqProjects = async (querySource) => {
  let query = {};
  switch (querySource) {
    case 'In-progress':
      query.status = 'In Progress';
      break
    case 'Quote':
      query.status = 'Quote';
      break;
    case 'Closed':
      query.status = 'Closed';
  }
  const projects = await MemoqProject.find(query);
  const clients = await Clients.find();
  const vendors = await Vendors.find();
  for (let i = 0; i < projects.length; i++) {
    let project = projects[i];
    const { documents, lockedForRecalculation } = project;
    project.status = getProjectStatus(documents);
    if (!lockedForRecalculation) {
      const doesHaveCorrectStructure = checkProjectStructure(clients, vendors, project, documents);
      if (doesHaveCorrectStructure) {
        await createOtherProjectFinanceData({
          project,
          documents
        });
      }
    }
  }
  return await getMemoqProjects(query);
};

const updateMemoqProjectFinance = async (project) => {
  const clients = await Clients.find();
  const vendors = await Vendors.find();
  const { documents, lockedForRecalculation } = project;
  project.status = getProjectStatus(documents);
  const doesHaveCorrectStructure = checkProjectStructure(clients, vendors, project, documents);
  if (!doesHaveCorrectStructure && lockedForRecalculation) {
    return project;
  }
  return await createOtherProjectFinanceData({ project, documents });
};

module.exports = { updateAllMemoqProjects, updateMemoqProjectFinance };
