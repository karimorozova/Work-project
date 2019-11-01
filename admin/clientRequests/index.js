const { getClientRequest, getClientRequests, updateClientRequest, getFilteredClientRequests } = require("./get");
const { createRequest } = require("./create");
const { storeRequestFiles, addRequestFile, removeRequestFile, removeRequestFiles } = require("./files");
const { clientRequestNotification } = require("./emails");

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
    clientRequestNotification
};