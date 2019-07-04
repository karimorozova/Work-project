const { Services } = require('../models/');

async function getManyServices(obj) {
    const services = await Services.find(obj)
        .populate('steps.step')
    return services;
}
  
async function getOneService(obj) {
    const service = await Services.findOne(obj)
        .populate('steps.step')
    return service;
}

module.exports = { getOneService, getManyServices };