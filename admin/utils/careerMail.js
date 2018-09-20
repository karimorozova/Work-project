const transporter = require("../services/mailer");

const mailhandler = {
    applicationMail(person) {
        let msg = "Email form application form."
        let mailOptions = {
            from: 'translation@pangea.global', // sender address
            to: 'daniyal@wellyes.ru', // pm@pangea.global list of receivers
            subject: 'Quote Details', // Subject line
            text: "plain text", // plain text body
            html: "<b>" + msg + "</b>" // html body
          };
      
          transporter.sendMail(mailOptions, (error, info) => {
            transporter.close();
            if (error) {
              return console.log(error);
            }
            console.log('Message sent: %s', info.messageId);
      
          });
    }
}

module.exports = mailhandler;
