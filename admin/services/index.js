const mailTransporter = require("./mailTransporter");
const { getXtmCustomers,saveTasks, saveTemplateTasks, getMetrics, createNewXtmCustomer, getRequestOptions, getTaskProgress, generateTargetFile, getEditorUrl } = require("./xtmApi");
const { getService, getServices } = require("./getServices");
const { getTokens, refreshToken, getRecords, getLeads, getActivities, getCallsCount, saveRecords } = require("./zoho");
const { getXtrfTierData, getFilteredJson, fillXtrfLqa, fillXtrfPrices } = require("./xtrf");

module.exports = {
    mailTransporter,
    getService,
    getServices,
    getXtmCustomers,
    saveTasks,
    saveTemplateTasks,
    getMetrics,
    createNewXtmCustomer,
    getRequestOptions,
    getTaskProgress,
    getTokens, 
    refreshToken, 
    getLeads, 
    getActivities,
    getCallsCount,
    getRecords,
    saveRecords,
    generateTargetFile,
    getEditorUrl,
    getXtrfTierData,
    getFilteredJson,
    fillXtrfLqa,
    fillXtrfPrices
}
