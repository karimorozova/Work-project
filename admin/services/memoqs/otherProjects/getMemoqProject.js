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

module.exports = {
  getMemoqProject,
  getProjectAfterUpdate
};
