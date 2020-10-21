const { MemoqProject, Clients } = require('../../../models');
const { isAllTasksFinished, checkProjectStructure, getProjectStatus } = require('./helpers');
const { createOtherProjectFinanceData } = require('./financeData');

const updateAllMemoqProjects = async () => {
  const projects = await MemoqProject.find();
  const clients = await Clients.find();
  for (let i = 0; i < projects.length; i++) {
    let project = projects[i];
    const { documents, lockedForRecalculation } = project;
    project.status = getProjectStatus(project);
    const doesHaveCorrectStructure = project.status !== 'Quote' ?
      checkProjectStructure(clients, project, documents) : false;
    if (doesHaveCorrectStructure && !lockedForRecalculation) {
      return await createOtherProjectFinanceData({
        project,
        documents
      });
    }
  }
  return projects;
};

const updateMemoqProjectFinance = async (project) => {
  const clients = await Clients.find();
  const { documents } = project;
  project.status = isAllTasksFinished(documents) ? 'Closed' : 'In progress';
  const doesHaveCorrectStructure = checkProjectStructure(clients, project, documents);
  if (!doesHaveCorrectStructure) {
    return project;
  }
  return await createOtherProjectFinanceData({ project, documents });
};

module.exports = { updateAllMemoqProjects, updateMemoqProjectFinance };
