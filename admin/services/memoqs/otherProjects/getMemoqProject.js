const { MemoqProject } = require('../../../models');

const getMemoqProject = async (obj) => {
  return await MemoqProject.findOne(obj)
    .populate('customer')
    .populate('projectManager', ['firstName', 'lastName', 'photo', 'email'])
    .populate('accountManager', ['firstName', 'lastName', 'photo', 'email'])
    .populate('steps.vendor', ['firstName', 'surname', 'email']);
};

const getProjectAfterUpdate = async (query, update) => {
  return await MemoqProject.findOneAndUpdate(query, update, { new: true })
    .populate('customer')
    .populate('projectManager', ['firstName', 'lastName', 'photo', 'email'])
    .populate('accountManager', ['firstName', 'lastName', 'photo', 'email'])
    .populate('steps.vendor', ['firstName', 'surname', 'email']);
};

const getMemoqProjects = async (query = {}) => {
  return await MemoqProject.find(query).sort({ _id: -1 }).limit(25)
    .populate('customer')
    .populate('projectManager', ['firstName', 'lastName', 'photo', 'email'])
    .populate('accountManager', ['firstName', 'lastName', 'photo', 'email'])
    .populate('steps.vendor', ['firstName', 'surname', 'email']);
};

const getMemoqProjectsForClientPortal = async (query) => {
  const neededKeysObj = {
    name: 1,
    status: 1,
    tasks: 1,
    steps: 1,
    creationTime: 1,
    deadline: 1,
    finance: 1,
    accountManager: 1
  };
  const projects = await MemoqProject.find(query, neededKeysObj).populate('accountManager');
  const structuredProjects = [];
  for (let { _doc } of projects) {
    const projectIdRegex = new RegExp(/[0-9]{4} (0[1-9]|1[0-2]) (0[1-9]|[1-2][0-9]|3[0-1]) \[[0-9]{2}]/g);
    const projectId = _doc.name.match(projectIdRegex);
    if (projectId) {
      _doc.projectId = projectId[0];
    } else {
      _doc.projectId = _doc.name;
    }
    _doc.projectName = _doc.name;
    _doc.startDate = _doc.creationTime;
    delete _doc.name;
    delete _doc.creationTime;
    structuredProjects.push(_doc);
  }
  return structuredProjects;
};

module.exports = {
  getMemoqProject,
  getProjectAfterUpdate,
  getMemoqProjects,
  getMemoqProjectsForClientPortal
};
