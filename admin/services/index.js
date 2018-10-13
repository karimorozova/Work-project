const mailTransporter = require("./mailTransporter");
const { saveTasks, saveTemplateTasks, getMetrics, createNewXtmCustomer } = require("./xtmApi");
const { getOneService, getManyServices } = require("./getServices");
const { deleteServiceRate } = require("./rates");

const services = {
    mailTransporter,
    getOneService,
    getManyServices,
    saveTasks,
    saveTemplateTasks,
    getMetrics,
    createNewXtmCustomer,
    deleteServiceRate
}

module.exports = services