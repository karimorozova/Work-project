const mailTransporter = require("./mailTransporter");
const { saveTasks, saveTemplateTasks, getMetrics, createNewXtmCustomer, getRequestOptions, getTaskProgress } = require("./xtmApi");
const { getOneService, getManyServices } = require("./getServices");
const { createNewRate, updateRate, deleteRate, updateLangCombs } = require("./rates");

module.exports = {
    mailTransporter,
    getOneService,
    getManyServices,
    saveTasks,
    saveTemplateTasks,
    getMetrics,
    createNewXtmCustomer,
    getRequestOptions,
    createNewRate,
    updateRate,
    deleteRate,
    updateLangCombs,
    getTaskProgress
}
