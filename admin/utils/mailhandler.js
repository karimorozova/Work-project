const nodemailer = require('nodemailer');
const apiUrl = require("../helpers/apiurl");

const mailhandler = {
  sendMail(request) {
    let detailFile = "";
    if (request.detailFiles.length > 0) {
      for (var i = 0; i < request.detailFiles.length; i++) {
        detailFile += `<a href="${apiUrl}/reqfiles/${request.id}/${request.detailFiles[i]}" download target='_self'>${request.detailFiles[i]}</a><br/>`;
      }
    }

    let referenceFile = "";
    if (request.refFiles.length > 0) {
      for (var i = 0; i < request.refFiles.length; i++) {
        referenceFile += `<a href="${apiUrl}/reqfiles/${request.id}/${request.refFiles[i]}" download target='_self'>${request.refFiles[i]}</a><br/>`;
      }
    }

    var targetLangs = "";
    request.targetLanguages.forEach(element => {
      targetLangs += element.lang + ", ";
    });

    let transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com', //in-v3.mailjet.com
      port: 587,
      secure: false, // upgrade later with STARTTLS
      auth: {
        user: 'translation@pangea.global', //2a629a8646758c2140a8aced91f03dcb
        pass: '@Png122019!' //fc72170d536b40480711bfad6ff1a8c1
      }
    });
    var msg = `<table style="border: 2px solid #66563D;border-collapse: collapse;font-size: 14px;width: 400px;color: #66563D">
    <thead>
      <td colspan="2" class="header" style="border: 2px solid #66563D;background-color: #F8D260;font-size: 15px;font-weight: bold;text-align: center;padding: 8px;width: 50%">CONTACT DETAILS</td>
    </thead>
    <tbody>
      <tr>
        <td class="title" style="border: 0.8px solid rgba(102, 86, 61, 0.51);padding: 8px;width: 50%;font-weight: bold;border-right: 2px solid rgba(102, 86, 61, 0.51)">
          Name:
        </td>
        <td style="border: 0.8px solid rgba(102, 86, 61, 0.51);padding: 8px;width: 50%">
          ${request.contactName}
        </td>
      </tr>
      <tr>
        <td class="title" style="border: 0.8px solid rgba(102, 86, 61, 0.51);padding: 8px;width: 50%;font-weight: bold;border-right: 2px solid rgba(102, 86, 61, 0.51)">
          Company Name:
        </td>
        <td style="border: 0.8px solid rgba(102, 86, 61, 0.51);padding: 8px;width: 50%">
          ${request.companyName}
        </td>
      </tr><tr>
        <td class="title" style="border: 0.8px solid rgba(102, 86, 61, 0.51);padding: 8px;width: 50%;font-weight: bold;border-right: 2px solid rgba(102, 86, 61, 0.51)">
          Email:
        </td>
        <td style="border: 0.8px solid rgba(102, 86, 61, 0.51);padding: 8px;width: 50%">
          ${request.contactEmail}
        </td>
      </tr><tr>
        <td class="title" style="border: 0.8px solid rgba(102, 86, 61, 0.51);padding: 8px;width: 50%;font-weight: bold;border-right: 2px solid rgba(102, 86, 61, 0.51)">
          Website:
        </td>
        <td style="border: 0.8px solid rgba(102, 86, 61, 0.51);padding: 8px;width: 50%">
          ${request.web}
        </td>
      </tr><tr>
        <td class="title" style="border: 0.8px solid rgba(102, 86, 61, 0.51);padding: 8px;width: 50%;font-weight: bold;border-right: 2px solid rgba(102, 86, 61, 0.51)">
          Phone Number:
        </td>
        <td style="border: 0.8px solid rgba(102, 86, 61, 0.51);padding: 8px;width: 50%">
          ${request.phone}
        </td>
      </tr><tr>
        <td class="title" style="border: 0.8px solid rgba(102, 86, 61, 0.51);padding: 8px;width: 50%;font-weight: bold;border-right: 2px solid rgba(102, 86, 61, 0.51)">
          Skype:
        </td>
        <td style="border: 0.8px solid rgba(102, 86, 61, 0.51);padding: 8px;width: 50%">
          ${request.skype}
        </td>
      </tr>
      <tr>
        <td colspan="2" class="header" style="border: 2px solid #66563D;background-color: #F8D260;font-size: 15px;font-weight: bold;text-align: center;padding: 8px;width: 50%">PROJECT DETAILS</td>
      </tr>
      <tr>
        <td class="title" style="border: 0.8px solid rgba(102, 86, 61, 0.51);padding: 8px;width: 50%;font-weight: bold;border-right: 2px solid rgba(102, 86, 61, 0.51)">Service Type:</td>
        <td style="border: 0.8px solid rgba(102, 86, 61, 0.51);padding: 8px;width: 50%">${request.service.title}</td>
      </tr>
      <tr>
        <td class="title" style="border: 0.8px solid rgba(102, 86, 61, 0.51);padding: 8px;width: 50%;font-weight: bold;border-right: 2px solid rgba(102, 86, 61, 0.51)">Source Language:</td>
        <td style="border: 0.8px solid rgba(102, 86, 61, 0.51);padding: 8px;width: 50%">${request.sourceLanguage.lang}</td>
      </tr>
      <tr>
        <td class="title" style="border: 0.8px solid rgba(102, 86, 61, 0.51);padding: 8px;width: 50%;font-weight: bold;border-right: 2px solid rgba(102, 86, 61, 0.51)">Target Languages:</td>
        <td style="border: 0.8px solid rgba(102, 86, 61, 0.51);padding: 8px;width: 50%">${targetLangs}</td>
      </tr>
      <tr>
        <td class="title" style="border: 0.8px solid rgba(102, 86, 61, 0.51);padding: 8px;width: 50%;font-weight: bold;border-right: 2px solid rgba(102, 86, 61, 0.51)">Industry</td>
        <td style="border: 0.8px solid rgba(102, 86, 61, 0.51);padding: 8px;width: 50%">${request.industry.name}</td>
      </tr>
      <tr>
        <td class="title" style="border: 0.8px solid rgba(102, 86, 61, 0.51);padding: 8px;width: 50%;font-weight: bold;border-right: 2px solid rgba(102, 86, 61, 0.51)">Reference Files:</td>
        <td style="border: 0.8px solid rgba(102, 86, 61, 0.51);padding: 8px;width: 50%">${referenceFile}</td>
      </tr>
      <tr>
        <td class="title" style="border: 0.8px solid rgba(102, 86, 61, 0.51);padding: 8px;width: 50%;font-weight: bold;border-right: 2px solid rgba(102, 86, 61, 0.51)">Files:</td>
        <td style="border: 0.8px solid rgba(102, 86, 61, 0.51);padding: 8px;width: 50%">${detailFile}</td>
      </tr>
      <tr>
        <td class="title" style="border: 0.8px solid rgba(102, 86, 61, 0.51);padding: 8px;width: 50%;font-weight: bold;border-right: 2px solid rgba(102, 86, 61, 0.51)">Brief:</td>
        <td style="border: 0.8px solid rgba(102, 86, 61, 0.51);padding: 8px;width: 50%">${request.brief}</td>
      </tr>
      <tr>
        <td class="title" style="border: 0.8px solid rgba(102, 86, 61, 0.51);padding: 8px;width: 50%;font-weight: bold;border-right: 2px solid rgba(102, 86, 61, 0.51)">Deadline:</td>
        <td style="border: 0.8px solid rgba(102, 86, 61, 0.51);padding: 8px;width: 50%">${request.date}</td>
      </tr>
    </tbody>
</table>`;

    let mailOptions = {
      from: 'translation@pangea.global', // sender address
      to: 'sales@pangea.global', // sales@pangea.global, illy@pangea.global
      subject: `A new lead from ${request.companyName}`, // Subject line
      text: "plain text", // plain text body
      html: "<b>" + msg + "</b>" // html body
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log('Message sent: %s', info.messageId);

    });

  }
}



module.exports = mailhandler;
