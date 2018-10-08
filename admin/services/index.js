const mailTransporter = require("./mailTransporter");
const { getOneService, getManyServices } = require("./getServices");
const Services = {
    mailTransporter,
    getOneService,
    getManyServices
}

module.exports = Services