const mailTransporter = require("./mailTransporter");
const { saveTasks, saveTemplateTasks, getMetrics, createNewXtmCustomer, getRequestOptions } = require("./xtmApi");
const { getOneService, getManyServices } = require("./getServices");
const { checkServiceRatesMatches, deleteServiceRate, updateLangCombs } = require("./rates");

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
    updateLangCombs
}

module.exports = services