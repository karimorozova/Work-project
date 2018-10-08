const { Services } = require('../models/');

async function getManyServices(obj) {
    const services = await Services.find(obj)
    .populate('languageCombinations.source')
    .populate('languageCombinations.target')
    .populate('languageCombinations.industries.industry');
    return services;
}
  
async function getOneService(obj) {
    const service = await Services.findOne(obj)
    .populate('languageCombinations.source')
    .populate('languageCombinations.target')
    .populate('languageCombinations.industries.industry');
    return service;
}

module.exports = { getOneService, getManyServices };