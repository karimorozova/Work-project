const { sendEmail, clientQuoteEmail, managerNotifyMail } = require('./mailTemplate');
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
    archiveFile,
    stepReassignedNotification,
}