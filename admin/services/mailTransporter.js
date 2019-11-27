const nodemailer = require('nodemailer');

const mailTransporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, 
    auth: {
      user: 'translation@pangea.global',
      pass: '@Png122019!'
    }
});

module.exports = mailTransporter;

