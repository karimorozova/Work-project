const nodemailer = require('nodemailer');

const mailhandler = {
  sendMail(request) {

    let transporter = nodemailer.createTransport({
      host: 'email-smtp.us-east-1.amazonaws.com',
      port: 465,
      secure: true, // upgrade later with STARTTLS
      auth: {
        user: 'AKIAJICV5JCK4NXBDCLQ',
        pass: 'AuetzT/oBNpG3GtBrHRBFqO7sBHrcVfr3zNOMGFaF40P'
      }
    });

    var msg = "<b>" +
      "Suggested Deadline : " + request.date + "<br/>" +
      "Contact Name : " + request.contactName + "<br/>" +
      "Contact Email : " + request.contactEmail + "<br/>" +
      "Web : " + request.web + "<br/>" +
      "Skype : " + request.skype + "<br/>" +
      "Phone : " + request.phone + "<br/>" +
      "Service : " + request.service.title + "<br/>" +
      "Industry : " + request.industry + "<br/>" +
      "Status : " + request.status + "<br/>" +
      "Account manager : " + request.accountManager + "<br/>" +
      "Company name : " + request.companyName + "<br/>";
    if (request.detailFiles.length > 0) {
      msg += "Detail File : ";
      for (var i = 0; i < request.detailFiles.length; i++) {
        msg += "<a href='http://admin.pangea.global/reqfiles/" + request.id + "/";
        msg += request.detailFiles[i];
        msg += "' download target='_self'>" + request.detailFiles[i] + "</a><br/>";
      }
    }
    if (request.refFiles.length > 0) {
      msg += "Ref File : <a href='http://admin.pangea.global:81/uploads/" + request.refFiles[0].filename + "' download target='_self'>" + request.refFiles[0].filename + "</a><br/>";
    }


    // Add targetLanguages
    msg += "Target Languages : ";
    request.targetLanguages.forEach(element => {
      msg += element.lang + ",";
    });
    msg += "<br/>";
    msg += "Brief : " + request.brief + "<br/>";
    msg += "Source languages : " + request.sourceLanguage.lang + "<br/>";

    let mailOptions = {
      from: 'pangea@wellyes.ru', // sender address
      to: 'sales@pangea.global', // list of receivers
      subject: `A new lead from ${request.companyName}`, // Subject line
      text: "plain text", // plain text body
      html: "<b>" + msg + "</b>" // html body
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
