const { sendEmail, clientQuoteEmail } = require('./mailTemplate');
const { applicationMessage, messageForClient, requestMessageForVendor } = require('./emailMessages');
module.exports = {
    sendEmail,
    clientQuoteEmail,
    applicationMessage,
    messageForClient,
    requestMessageForVendor
}