const { Projects } = require('../models/');

async function getProjects(obj) {
    const projects = await Projects.find(obj)
    .populate('industry')
    .populate('customer')
    .populate('projectManager');
    return projects;
}
  
async function getProject(obj) {
    const project = await Projects.findOne(obj)
    .populate('industry')
    .populate('customer')
    .populate('projectManager');
    return project;
}

module.exports = { getProject, getProjects };