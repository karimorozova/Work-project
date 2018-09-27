const { mailTransporter } = require("../services");

const sendEmail = function (obj, msg) {
    return new Promise( (res, rej) => {
        let mailOptions = {
            from: 'translation@pangea.global', // sender address
            to: `${obj.to}`, // pm@pangea.global list of receivers
            subject: `${obj.subject}`, // Subject line
            text: "plain text", // plain text body
            html: "<b>" + msg + "</b>" // html body
          };
      
          mailTransporter.sendMail(mailOptions, (error, info) => {
            mailTransporter.close();
            if (error) {
                rej(error);
            }
        console.log('Message sent: %s', info.messageId);
        res(info.messageId);
        });
    })
}

module.exports = sendEmail;