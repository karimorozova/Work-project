const nodemailer = require('nodemailer');

const mailhandler = {
    sendMail(request) {
        let transporter = nodemailer.createTransport({
            host: 'smtp.yandex.ru',
            port: 465,
            secure: true, // upgrade later with STARTTLS
            auth: {
                user: 'ccvt@sochi.com',
                pass: 'Ivideon#2017'
            }
        });
        
        let mailOptions = {
            from: 'ccvt@sochi.com', // sender address
            to: 'da-lu@lenta.ru', // list of receivers
            subject: 'Pangea test', // Subject line
            text: "plain text", // plain text body
            html: "<b>" + request +"</b>"// html body
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message sent: %s', info.messageId);
           
            // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
            // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
        });

    }
}

module.exports = mailhandler;