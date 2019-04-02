const { xtmToken, xtmBaseUrl } = require('./xtm');
const secretKey = require('./jwtkey');
const zohoCreds = require('./zoho');

module.exports = {
    xtmToken,
    xtmBaseUrl,
    secretKey,
    zohoCreds
}