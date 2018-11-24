const mailTransporter = require("./mailTransporter");
const { saveTasks, saveTemplateTasks, getMetrics, createNewXtmCustomer, getRequestOptions, getTaskProgress } = require("./xtmApi");
const { getOneService, getManyServices } = require("./getServices");
const { createNewRate, updateRate, checkServiceRatesMatches, deleteServiceRate, updateLangCombs } = require("./rates");

module.exports = {
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
    createNewRate,
    updateRate,
    updateLangCombs,
    getTaskProgress
}
