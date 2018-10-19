const { sendEmail, clientQuoteEmail } = require('./mailTemplate');
const { applicationMessage, messageForClient, requestMessageForVendor } = require('./emailMessages');
const  { sendMail } = require('./mailhandler');
const { sendMailClient } = require('./mailhandlerclient');
const { sendMailPortal } = require('./mailhandlerportal');
const { clientMail } = require('./mailtoclients');
const { pmMail } = require('./mailtopm');
const { vendorMail } = require('./mailtovendor');
const upload = require('./uploads');
const moveFile = require('./moveFile')

module.exports = {
    sendEmail,
    clientQuoteEmail,
    applicationMessage,
    messageForClient,
    requestMessageForVendor,
    upload,
    moveFile,
    sendMail,
    sendMailClient,
    sendMailPortal,
    clientMail,
    pmMail,
    vendorMail
}