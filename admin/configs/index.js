const secretKey = require('./jwtkey');
const zohoCreds = require('./zoho');
const { xmlHeader, getHeaders, createCORSRequest } = require('./memoq');

module.exports = {
    secretKey,
    zohoCreds,
    xmlHeader, 
    getHeaders,
    createCORSRequest
}