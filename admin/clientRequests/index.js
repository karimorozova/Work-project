const { getClientRequest, getClientRequests, updateClientRequest, getFilteredClientRequests } = require("./get");
const { createRequest } = require("./create");
const { storeRequestFiles, addRequestFile, removeRequestFile, removeRequestFiles, removeClientRequest } = require('./files');
const { clientRequestNotification, sendNotificationToManager, notifyRequestCancelled } = require('./emails');

module.exports = {
  getClientRequest,
  getClientRequests,
  updateClientRequest,
  getFilteredClientRequests,
  createRequest,
  storeRequestFiles,
  addRequestFile,
  removeRequestFile,
  removeRequestFiles,
  clientRequestNotification,
  sendNotificationToManager,
  removeClientRequest,
  notifyRequestCancelled
};
