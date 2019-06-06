const { sendEmail, clientQuoteEmail, managerNotifyMail } = require('./mailTemplate');
const { applicationMessage, messageForClient, requestMessageForVendor, managerAssignmentNotifyingMessage, 
    vendorNotificationMessage, taskReadyMessage, deliverablesDownloadedMessage, vendorReassignmentMessage } = require('./emailMessages');
const { sendMail } = require('./mailhandler');
const { sendMailClient } = require('./mailhandlerclient');
const { sendMailPortal } = require('./mailhandlerportal');
const { clientMail } = require('./mailtoclients');
const { pmMail } = require('./mailtopm');
const { vendorMail } = require('./mailtovendor');
const { notifyManagerProjectStarts, stepVendorsRequestSending, stepEmailToVendor, sendEmailToContact, stepReassignedNotification } = require('./projectMails');
const upload = require('./uploads');
const { moveFile } = require('./movingFile');
const { archiveFile } = require('./archiving');

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
    notifyManagerProjectStarts,
    stepVendorsRequestSending,
    stepEmailToVendor,
    sendEmailToContact,
    vendorNotificationMessage,
    archiveFile,
    taskReadyMessage,
    deliverablesDownloadedMessage,
    vendorReassignmentMessage,
    stepReassignedNotification
}