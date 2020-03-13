const mailTransporter = require("./mailTransporter");
const { getService, getServices } = require("./getServices");
const { getTokens, refreshToken, getRecords, getLeads, getActivities, getCallsCount, saveRecords } = require("./zoho");
const { getXtrfTierData, getFilteredJson, fillXtrfLqa, fillXtrfPrices } = require("./xtrf");

module.exports = {
    mailTransporter,
    getService,
    getServices,
    getTokens, 
    refreshToken, 
    getLeads, 
    getActivities,
    getCallsCount,
    getRecords,
    saveRecords,
    getXtrfTierData,
    getFilteredJson,
    fillXtrfLqa,
    fillXtrfPrices,
}
