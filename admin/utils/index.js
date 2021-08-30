const {
  sendEmail,
  sendFlexibleEmail,
  clientQuoteEmail,
  managerNotifyMail
} = require("./mailTemplate");
const { sendMail } = require("./mailhandler");
const { sendMailClient } = require("./mailhandlerclient");
const { sendMailPortal } = require("./mailhandlerportal");
const { pmMail } = require("./mailtopm");

const {
  notifyManagerProjectStarts,
  notifyManagerProjectRejected,
  stepVendorsRequestSending,
  stepEmailToVendor,
  sendEmailToContact,
  stepReassignedNotification,
  stepMiddleReassignedNotification,
  stepMiddleAssignNotification,
  notifyClientProjectCancelled,
  notifyClientTasksCancelled,
  sendQuoteToVendorsAfterProjectAccepted,
} = require("./projectMails");

const upload = require("./uploads");
const { moveFile } = require("./movingFile");
const { archiveFile } = require("./archiving");

module.exports = {
  sendQuoteToVendorsAfterProjectAccepted,
  sendEmail,
  sendFlexibleEmail,
  clientQuoteEmail,
  upload,
  moveFile,
  sendMail,
  sendMailClient,
  sendMailPortal,
  pmMail,
  managerNotifyMail,
  notifyManagerProjectStarts,
  notifyManagerProjectRejected,
  stepVendorsRequestSending,
  stepEmailToVendor,
  sendEmailToContact,
  archiveFile,
  stepReassignedNotification,
  notifyClientProjectCancelled,
  notifyClientTasksCancelled,
  stepMiddleReassignedNotification,
  stepMiddleAssignNotification
};
