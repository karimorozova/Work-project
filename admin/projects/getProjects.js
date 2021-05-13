const { Projects, Clients } = require('../models/');
const { getFilterdProjectsQuery } = require('./filter');

async function getProjects(obj) {
  return await Projects.find(obj)
    .populate('industry')
    .populate('customer')
    .populate('service')
    .populate('projectManager', ['firstName', 'lastName', 'photo', 'email'])
    .populate('accountManager', ['firstName', 'lastName', 'photo', 'email'])
    .populate('steps.vendor', ['firstName', 'surname', 'email']);
}

async function getProject(obj) {
  const project = await Projects.findOne(obj)
    .populate('industry')
    .populate('service')
    .populate('projectManager', ['firstName', 'lastName', 'photo', 'email'])
    .populate('accountManager', ['firstName', 'lastName', 'photo', 'email'])
    .populate('steps.vendor', ['firstName', 'surname', 'email']);
  project.customer = await Clients.findOne({ _id: project.customer })
    .populate('sourceLanguages')
    .populate('targetLanguages');
  return project
}

async function updateProject(query, update) {
  return await Projects.findOneAndUpdate(query, update, { new: true })
    .populate('industry')
    .populate('customer')
    .populate('service')
    .populate('projectManager', ['firstName', 'lastName', 'photo', 'email'])
    .populate('accountManager', ['firstName', 'lastName', 'photo', 'email'])
    .populate('steps.vendor', ['firstName', 'surname', 'email']);
}

async function getProjectAfterUpdate(query, update) {
  return await Projects.findOneAndUpdate(query, update, { new: true })
    .populate('industry')
    .populate('customer')
    .populate('service')
    .populate('projectManager', ['firstName', 'lastName', 'photo', 'email'])
    .populate('accountManager', ['firstName', 'lastName', 'photo', 'email'])
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
      $project: {
        billingDate: 0,
        "customer.aliases": 0,
        "customer.billingInfo": 0
      }
    },
    // {
    //   $unset: [
    //     "billingDate", "brief", "clientContacts", "clientProjectNumber",
    //     "crossRate", "dateFormatted", "discounts", "genBrief", "industry"
    //   ]
    // },
    {
      $match: {
        ...query
      }
    },
    { $unwind: "$customer" }
  ]).sort({ startDate: -1 }).limit(25)
  try {
    return Projects.populate(projects, [
      'industry',
      'service',
      { path: 'projectManager', select: ['firstName', 'lastName', 'photo', 'email'] },
      { path: 'accountManager', select: ['firstName', 'lastName', 'photo', 'email'] },
      { path: 'steps.vendor', select: ['firstName', 'surname', 'email'] }

    ])
  } catch (err) {
    console.log(err);
    console.log("Error on getting filtered projects");
  }
}

module.exports = { getProject, getProjects, updateProject, getFilteredProjects, getProjectAfterUpdate };
