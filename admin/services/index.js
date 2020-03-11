const mailTransporter = require("./mailTransporter");
const { createNewXtmCustomer } = require("./xtmApi");
const { getService, getServices } = require("./getServices");
const { getTokens, refreshToken, getRecords, getLeads, getActivities, getCallsCount, saveRecords } = require("./zoho");
const { getXtrfTierData, getFilteredJson, fillXtrfLqa, fillXtrfPrices } = require("./xtrf");

module.exports = {
    mailTransporter,
    getService,
    getServices,
    createNewXtmCustomer,
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
