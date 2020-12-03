const { MemoqProject, Clients, Vendors, GmailMessages } = require('../../../models');
const { checkProjectStructure } = require('./helpers');
const { createOtherProjectFinanceData } = require('./financeData');
const { getMemoqProjects, getProjectAfterUpdate } = require('./getMemoqProject');

const updateAllMemoqProjects = async (querySource) => {
  let query = {};
  switch (querySource) {
    case 'In-progress':
      query.status = 'In progress';
      break;
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

const parseMessagesAndUpdateProjects = async (status) => {
  let query = status === 'Quote' ? 'Decide on quote' : 'Project Approved';
  const { messages } = await GmailMessages.findOne({ name: query });
  for (let i = 0; i < messages.length; i += 1) {
    let { projectName, isRead } = messages[i];
    if (!isRead) {
      const project = await MemoqProject.findOne({ $and: [{ name: projectName }, { status: { $ne: 'Closed' } }] });
      if (project) {
        messages[i].isRead = true;
        await MemoqProject.updateOne({ _id: project._id }, { status });
      }
    }
  }
};

const updateMemoqProjectFinance = async (project) => {
  const clients = await Clients.find();
  const vendors = await Vendors.find();
  const { documents, lockedForRecalculation } = project;
  const doesHaveCorrectStructure = checkProjectStructure(clients, vendors, project, documents);
  if (!doesHaveCorrectStructure || lockedForRecalculation) {
    return project;
  }
  return await createOtherProjectFinanceData({ project, documents });
};

const updateMemoqProjectStatus = async (_id, direction) => {
  const { status } = await MemoqProject.findOne({ _id });
  let updatedStatus;
  if (direction === 'Forward') {
    switch (status) {
      case 'Quote':
        updatedStatus = 'In progress';
        break;
      case 'In progress':
        updatedStatus = 'Closed';
    }
  } else {
    switch (status) {
      case 'In progress':
        updatedStatus = 'Quote';
        break;
      case 'Closed':
        updatedStatus = 'In progress';
    }
  }
  return await getProjectAfterUpdate({ _id }, { status: updatedStatus });
};

module.exports = {
  updateAllMemoqProjects,
  updateMemoqProjectFinance,
  updateMemoqProjectStatus,
  parseMessagesAndUpdateProjects
};
