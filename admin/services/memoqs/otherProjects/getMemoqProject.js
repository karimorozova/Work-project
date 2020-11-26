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
    accountManager: 1,
    domain: 1,
  };
  const projects = await MemoqProject.find(query, neededKeysObj).populate('accountManager', ['firstName', 'lastName']);
  const structuredProjects = [];
  for (let { _doc } of projects) {
    const projectIdRegex = new RegExp(/(?<!ABC).*\d]/g);
    const projectNameRegex = new RegExp(/[A-z][^\[\d\]\s].*/g);
    const projectId = _doc.name.match(projectIdRegex);
    const projectName = _doc.name.match(projectNameRegex);
    _doc.projectId = projectId ? projectId[0] : '';
    _doc.projectName = projectName ? projectName[0] : _doc.name;
    _doc.startDate = _doc.creationTime;
    _doc.fromXTRF = true;
    _doc.status =  _doc.status === 'Quote'? 'Quote sent' : _doc.status;
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
