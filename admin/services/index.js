const mailTransporter = require("./mailTransporter");
const { saveTasks, saveTemplateTasks, getMetrics, createNewXtmCustomer } = require("./xtmApi");
const { getOneService, getManyServices } = require("./getServices");
const { checkServiceRates, deleteServiceRate } = require("./rates");

const services = {
    mailTransporter,
    getOneService,
    getManyServices,
    saveTasks,
    saveTemplateTasks,
    getMetrics,
    createNewXtmCustomer,
    checkServiceRates,
    deleteServiceRate
}

module.exports = services