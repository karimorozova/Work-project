const { MemoqProject, Clients } = require('../../../models');
const { isAllTasksFinished, checkProjectStructure } = require('./helpers');
const { createOtherProjectFinanceData } = require('./financeData');

const updateAllMemoqProjects = async () => {
  const projects = await MemoqProject.find();
  const clients = await Clients.find();
  for (let i = 0; i < projects.length; i++) {
    let project = projects[i];
    const { documents, lockedForRecalculation } = project;
    const doesHaveDocuments = documents !== null && documents !== undefined;
    project.status = doesHaveDocuments ? isAllTasksFinished(documents) ? 'Closed' : 'In progress' : 'In progress';
    const doesHaveCorrectStructure = doesHaveDocuments ? checkProjectStructure(clients, project, documents) : false;
    if (doesHaveCorrectStructure && project.status !== 'In progress' && !lockedForRecalculation) {
      await createOtherProjectFinanceData({
        project,
        documents
      });
    }
  }
};

const updateMemoqProjectFinance = async (project) => {
  const clients = await Clients.find();
  const { documents } = project;
  project.status = isAllTasksFinished(documents) ? 'Closed' : 'In progress';
  const doesHaveCorrectStructure = checkProjectStructure(clients, project, documents);
  if (!doesHaveCorrectStructure && project.status === 'In progress') {
    return project;
  }
  return await createOtherProjectFinanceData({ project, documents });
};

module.exports = { updateAllMemoqProjects, updateMemoqProjectFinance };
