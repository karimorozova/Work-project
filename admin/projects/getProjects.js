const { Projects } = require('../models/');

async function getProjects(obj) {
    return await Projects.find(obj)
        .populate('industry')
        .populate('customer')
        .populate('service')
        .populate('projectManager', ['firstName', 'lastName', 'photo'])
        .populate('accountManager', ['firstName', 'lastName', 'photo'])
        .populate('steps.vendor', ['firstName', 'surname', 'email']);
}

async function getProject(obj) {
    return await Projects.findOne(obj)
        .populate('industry')
        .populate('customer')
        .populate('service')
        .populate('projectManager', ['firstName', 'lastName', 'photo'])
        .populate('accountManager', ['firstName', 'lastName', 'photo'])
        .populate('steps.vendor', ['firstName', 'surname', 'email']);
}

async function updateProject(query, update) {
    return await Projects.findOneAndUpdate(query, update, {new: true})
        .populate('industry')
        .populate('customer')
        .populate('service')
        .populate('projectManager', ['firstName', 'lastName', 'photo'])
        .populate('accountManager', ['firstName', 'lastName', 'photo'])
        .populate('steps.vendor', ['firstName', 'surname', 'email']);
}

module.exports = { getProject, getProjects, updateProject };
