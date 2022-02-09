const { xmlHeader, getHeaders, createCORSRequest } = require('./memoq');
const env = process.env

const zohoCreds = {
    client_id: env.ZOHO_CLIENT_ID,
    client_secret: env.ZOHO_CLIENT_SECRET,
    redirect_uri: env.ZOHO_REDIRECT_URI
}

module.exports = {
    secretKey: env.SECRET_KEY,
    xmlHeader,
    getHeaders,
    createCORSRequest,
    zohoCreds,
}