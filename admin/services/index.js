const mailTransporter = require("./mailTransporter");
const { saveTasks, saveTemplateTasks, getMetrics, createNewXtmCustomer, getRequestOptions } = require("./xtmApi");
const { getOneService, getManyServices } = require("./getServices");
const { checkServiceRatesMatches, deleteServiceRate, severalLangCombs } = require("./rates");

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
    getRequestOptions,
    severalLangCombs
}

module.exports = services