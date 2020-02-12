const { xtmToken, xtmBaseUrl } = require('./xtm');
const secretKey = require('./jwtkey');
const zohoCreds = require('./zoho');
const { xmlHeader, getHeaders, createCORSRequest } = require('./memoq');

module.exports = {
    xtmToken,
    xtmBaseUrl,
    secretKey,
    zohoCreds,
    xmlHeader, 
    getHeaders,
    createCORSRequest
}