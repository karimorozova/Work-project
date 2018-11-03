const { sendEmail, clientQuoteEmail, managerNotifyMail } = require('./mailTemplate');
const { applicationMessage, messageForClient, requestMessageForVendor, managerAssignmentNotifyingMessage } = require('./emailMessages');
const  { sendMail } = require('./mailhandler');
const { sendMailClient } = require('./mailhandlerclient');
const { sendMailPortal } = require('./mailhandlerportal');
const { clientMail } = require('./mailtoclients');
const { pmMail } = require('./mailtopm');
const { vendorMail } = require('./mailtovendor');
const { managerNotifying, stepVendorsRequestSending, stepEmailToVendor } = require('./projectMails');
const upload = require('./uploads');
const moveFile = require('./moveFile')

module.exports = {
    sendEmail,
    clientQuoteEmail,
    applicationMessage,
    messageForClient,
    requestMessageForVendor,
    managerAssignmentNotifyingMessage,
    upload,
    moveFile,
    sendMail,
    sendMailClient,
    sendMailPortal,
    clientMail,
    pmMail,
    managerNotifyMail,
    vendorMail,
    managerNotifying,
    stepVendorsRequestSending,
    stepEmailToVendor
}