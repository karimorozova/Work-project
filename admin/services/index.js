const mailTransporter = require("./mailTransporter");
const { saveTasks, saveTemplateTasks, getMetrics, createNewXtmCustomer, getRequestOptions } = require("./xtmApi");
const { getOneService, getManyServices } = require("./getServices");
const { checkServiceRatesMatches, deleteServiceRate } = require("./rates");

const services = {
    mailTransporter,
    getOneService,
    getManyServices,
    saveTasks,
    saveTemplateTasks,
    getMetrics,
    createNewXtmCustomer,
    checkServiceRatesMatches,
    deleteServiceRate,
    getRequestOptions
}

module.exports = services