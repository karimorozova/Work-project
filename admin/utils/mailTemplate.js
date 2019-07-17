const mailTransporter = require("../services/mailTransporter");

const sendEmail = function (obj, msg) {
    return new Promise( (res, rej) => {
        let mailOptions = {
            from: 'translation@pangea.global', // sender address
            to: `${obj.to}`, // pm@pangea.global list of receivers
            subject: `${obj.subject}`, // Subject line
            text: "plain text", // plain text body
            html: "<b>" + msg + "</b>", // html body
        };
        if(obj.attachments && obj.attachments.length) {
            mailOptions.attachments = obj.attachments;
        }
        mailTransporter.sendMail(mailOptions, (error, info) => {
            mailTransporter.close();
            if (error) {
                console.log(error);
                rej(error);
            }
        console.log('Message sent: %s', info.messageId);
        res(info.messageId);
        });
    })
}

const clientQuoteEmail = function (obj, msg) {
    const contact = !obj.contact ? obj.contacts.find(item => item.leadContact): obj.contact;
    return new Promise( (res, rej) => {
        let mailOptions = {
            from: 'Michal <michal@pangea.global>',
            to: contact.email, 
            subject: obj.subject,
            text: "plain text",
            html: msg,
            attachments: [{
                filename: 'logo.png',
                path: './static/logo.png',
                cid: 'logo@pan' //same cid value as in the html img src
                }
            ]
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

const managerNotifyMail = function(obj, msg, subject) {
    return new Promise( (res, rej) => {
        let mailOptions = {
            from: 'translation@pangea.global',
            to: obj.email, 
            subject,
            text: "plain text",
            html: msg
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

module.exports = { sendEmail, clientQuoteEmail, managerNotifyMail };