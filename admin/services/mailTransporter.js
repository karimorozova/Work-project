const nodemailer = require('nodemailer');

const mailTransporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, 
    auth: {
      user: 'translation@pangea.global',
      pass: '@Png2021!!'
    }
});

module.exports = mailTransporter;

