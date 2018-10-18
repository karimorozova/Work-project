const { sendEmail, clientQuoteEmail } = require('./mailTemplate');
const { applicationMessage, messageForClient, requestMessageForVendor } = require('./emailMessages');
const upload = require('./uploads');
const moveFile = require('./moveFile')

module.exports = {
    sendEmail,
    clientQuoteEmail,
    applicationMessage,
    messageForClient,
    requestMessageForVendor,
    upload,
    moveFile
}