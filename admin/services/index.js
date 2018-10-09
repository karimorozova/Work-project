const mailTransporter = require("./mailTransporter");
const { saveTasks, saveTemplateTasks, getMetrics, newXtmCustomer } = require("./xtmApi");
const { getOneService, getManyServices } = require("./getServices");
const Services = {
    mailTransporter,
    getOneService,
    getManyServices,
    saveTasks,
    saveTemplateTasks,
    getMetrics,
    newXtmCustomer
}

module.exports = Services