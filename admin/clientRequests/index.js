const { getClientRequest, getClientRequests, updateClientRequest } = require("./get");
const { createRequest } = require("./create");
const { storeRequestFiles } = require("./files");

module.exports = { 
    getClientRequest, 
    getClientRequests, 
    updateClientRequest,
    createRequest,
    storeRequestFiles
};