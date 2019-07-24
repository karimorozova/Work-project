const mailTransporter = require("./mailTransporter");
const { getXtmCustomers,saveTasks, saveTemplateTasks, getMetrics, createNewXtmCustomer, getRequestOptions, getTaskProgress, generateTargetFile } = require("./xtmApi");
const { getOneService, getManyServices } = require("./getServices");
const { updatePricelistRate, deleteRate, updateLangCombs } = require("./rates");
const { getTokens, refreshToken, getRecords, getLeads, getActivities, getCallsCount, saveRecords } = require("./zoho");

module.exports = {
    mailTransporter,
    getOneService,
    getManyServices,
    getXtmCustomers,
    saveTasks,
    saveTemplateTasks,
    getMetrics,
    createNewXtmCustomer,
    getRequestOptions,
    updatePricelistRate,
    deleteRate,
    updateLangCombs,
    getTaskProgress,
    getTokens, 
    refreshToken, 
    getLeads, 
    getActivities,
    getCallsCount,
    getRecords,
    saveRecords,
    generateTargetFile
}
