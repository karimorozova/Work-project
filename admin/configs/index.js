const { xmlHeader, getHeaders, createCORSRequest } = require('./memoq');
const { createTransport } = require('nodemailer');

const env = process.env

const mailTransporter = createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: JSON.parse(env.SMTP_SECURE),
    auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS
    }
});

const zohoCreds = {
    client_id: env.ZOHO_CLIENT_ID,
    client_secret: env.ZOHO_CLIENT_SECRET,
    redirect_uri: env.ZOHO_REDIRECT_URI
}

module.exports = {
    secretKey: env.SESSION_KEY,
    xmlHeader,
    getHeaders,
    createCORSRequest,
    zohoCreds,
    mailTransporter,
}