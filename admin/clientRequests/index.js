const { getClientRequest, getClientRequests, updateClientRequest } = require("./get");
const { createRequest } = require("./create");
const { storeRequestFiles, addRequestFile, removeRequestFile, removeRequestFiles } = require("./files");

module.exports = { 
    getClientRequest, 
    getClientRequests, 
    updateClientRequest,
    createRequest,
    storeRequestFiles,
    addRequestFile,
    removeRequestFile,
    removeRequestFiles
};