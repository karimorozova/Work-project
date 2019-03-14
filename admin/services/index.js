const mailTransporter = require("./mailTransporter");
const { saveTasks, saveTemplateTasks, getMetrics, createNewXtmCustomer, getRequestOptions, getTaskProgress } = require("./xtmApi");
const { getOneService, getManyServices } = require("./getServices");
const { createNewRate, updateRate, deleteRate, updateLangCombs } = require("./rates");
const { getTokens, refreshToken, getRecords, getLeads, getActivities, getCallsCount } = require("./zoho");

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
    getTaskProgress,
    getTokens, 
    refreshToken, 
    getLeads, 
    getActivities,
    getCallsCount,
    getRecords
}
