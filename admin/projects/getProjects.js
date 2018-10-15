const { Projects } = require('../models/');

async function getProjects(obj) {
    return await Projects.find(obj)
    .populate('industry')
    .populate('customer')
    .populate('projectManager');
}
  
async function getProject(obj) {
    return await Projects.findOne(obj)
    .populate('industry')
    .populate('customer')
    .populate('projectManager');
}

async function getUpdatedProject(query, update) {
    return await Projects.findOneAndUpdate(query, update, {new: true})
    .populate('industry')
    .populate('customer')
    .populate('projectManager');
}

module.exports = { getProject, getProjects, getUpdatedProject };