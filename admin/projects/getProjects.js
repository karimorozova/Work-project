const { Projects } = require('../models/');
const { getFilterdProjectsQuery } = require('./filter');

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

async function getFilteredProjects(filters) {
    const query = getFilterdProjectsQuery(filters);
    const projects = await Projects.aggregate([
        {
            $lookup: {
                from: "clients",
                localField: "customer",
                foreignField: "_id",
                as: "customer"
            }
        },
        {
            $match: {
                ...query
            }
        },
        {$unwind: "$customer"}
    ]).sort({startDate: -1}).limit(25)
    try {
        return Projects.populate(projects, [
            'industry',
            'service',
            {path: 'projectManager', select: ['firstName', 'lastName', 'photo']},
            {path: 'accountManager', select: ['firstName', 'lastName', 'photo']},
            {path: 'steps.vendor', select: ['firstName', 'surname', 'photo']}

        ])
    } catch(err) {
        console.log(err);
        console.log("Error on getting filtered projects");
    }
}

module.exports = { getProject, getProjects, updateProject, getFilteredProjects };
