const { Services } = require('../models/');

async function getServices(obj) {
    const services = await Services.find(obj)
        .populate('steps.step')
    return services;
}
  
async function getService(obj) {
    const service = await Services.findOne(obj)
        .populate('steps.step')
    return service;
}

module.exports = { getService, getServices };