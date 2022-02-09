const {
  sendEmail,
  sendFlexibleEmail,
  clientQuoteEmail,
  managerNotifyMail
} = require("./mailTemplate");

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
