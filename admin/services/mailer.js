const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, 
    auth: {
      user: 'translation@pangea.global',
      pass: 'LetMeInNow!'
    }
});

module.exports = transporter;

