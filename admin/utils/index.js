const { sendEmail, clientQuoteEmail } = require('./mailTemplate');
const { applicationMessage, messageForClient } = require('./emailMessages');
module.exports = {
    sendEmail,
    clientQuoteEmail,
    applicationMessage,
    messageForClient
}