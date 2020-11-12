const mailTransporter = require("../services/mailTransporter");

const sendEmail = function (obj, msg, withoutImage = false) {
  return new Promise((res, rej) => {
    let mailOptions = {
      from: 'translation@pangea.global', // sender address
      to: `${obj.to}`, // pm@pangea.global list of receivers
      subject: `${obj.subject}`, // Subject line
      text: "plain text", // plain text body
      html: "<b>" + msg + "</b>", // html body
    };
    mailOptions.attachments = obj.attachments || [];
    if (!withoutImage) {
      mailOptions.attachments.push({
        filename: 'logo.png',
        path: './static/email-logo.png',
        cid: 'logo@pan' //same cid value as in the html img src
      })
    }
    mailTransporter.sendMail(mailOptions, (error, info) => {
      mailTransporter.close();
      if (error) {
        console.log(error);
        rej(error);
      }

      if (info) {
        console.log('Message sent: %s', info.messageId);
        res(info.messageId);
      } else {
        console.log('Error in sendEmail');
        rej("no message sent");
      }
    });
    })
}

const clientQuoteToEmails = function (obj, message) {
  return new Promise( (res, rej) => {
    let mailOptions = {
      from: 'Michal <michal@pangea.global>',
      to: obj.email,
      subject: obj.subject,
      text: "plain text",
      html: message,
    };
    mailOptions.attachments = obj.attachments || [];
    mailOptions.attachments.push({
      filename: 'logo.png',
      path: './static/email-logo.png',
      cid: 'logo@pan'
    });
    mailTransporter.sendMail(mailOptions, (error, info) => {
      mailTransporter.close();
      if (error) {
        console.log(error);
        rej(error);
      }
      const messageId = info && info.messageId ? info.messageId : "Error";
      console.log('Message sent: %s', messageId);
      res();
    });
  })
};

const clientQuoteEmail = function (obj, msg) {
    const contact = !obj.contact ? obj.contacts.find(item => item.leadContact): obj.contact;
    return new Promise( (res, rej) => {
        let mailOptions = {
          from: 'Michal <michal@pangea.global>',
          to: contact.email,
          subject: obj.subject,
          text: "plain text",
          html: msg,
        };
        mailOptions.attachments = obj.attachments || [];
        mailOptions.attachments.push({
            filename: 'logo.png',
            path: './static/email-logo.png',
            cid: 'logo@pan' //same cid value as in the html img src
        })
        mailTransporter.sendMail(mailOptions, (error, info) => {
            mailTransporter.close();
            if (error) {
                console.log(error);
                rej(error);
            }
        const messageId = info && info.messageId ? info.messageId : "Error";
        console.log('Message sent: %s', messageId);
        res();
        });
    })
}

const managerNotifyMail = function(obj, msg, subject) {
    return new Promise( (res, rej) => {
        let mailOptions = {
          from: 'translation@pangea.global',
          to: obj.email,
          subject,
          text: "plain text",
          html: msg
        };
        mailOptions.attachments = obj.attachments || [];
        mailOptions.attachments.push({
            filename: 'logo.png',
            path: './static/email-logo.png',
            cid: 'logo@pan' //same cid value as in the html img src
        })
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

module.exports = { sendEmail, clientQuoteEmail, managerNotifyMail, clientQuoteToEmails };
