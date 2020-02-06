const nodemailer = require('nodemailer');
const apiUrl = require("../helpers/apiurl");

const sendMailClient = function(request) {
    var detailFile = "";
    if (request.detailFiles.length > 0) {
      for (var i = 0; i < request.detailFiles.length; i++) {
        detailFile += `<a href=${apiUrl}/reqfiles/${request.id}/${request.detailFiles[i]} download target='_self'>${request.detailFiles[i]}</a><br/>`;
      }
    }

    var referenceFile = "";
    if (request.refFiles.length > 0) {
      for (var i = 0; i < request.refFiles.length; i++) {
        referenceFile += `<a href=${apiUrl}/reqfiles/${request.id}/${request.refFiles[i]} download target='_self'>${request.refFiles[i]}</a><br/>`;
      }
    }

    var targetLangs = "";
    request.targetLanguages.forEach(element => {
      targetLangs += element.lang + ",";
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
    var msg = `<div class="emailWrapper" style="width: 600px; padding:10px;">
    <a href="https://www.pangea.global/">
    <img src="cid:logo@pan" style="width: 50%;"></a>
    <p style="color: #66563D;font-size: 12px; line-height: 1.5em;">
    Hi ${request.contactName}, <br/>
    Thank you for your interest in Pangea Localization Services. <br/>
    I have received your information and will get in touch with you at the earliest opportunity. <br/>
    Please find a summary of your details below:
</p>
    <table style="border: 2px solid #66563D;border-collapse: collapse;font-size: 14px;width: 400px;color: #66563D">
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
</table>
<p style="color: #66563D;font-size: 12px">Looking forward to working together.</p>
    <p style="color: #66563D;font-size: 12px">
        <span style="color: #47A6A6;font-size: 16px">Amarita Sohal</span> <br/>
        Senior Business Development Manager <br/>
        E: amarita@pangea.global <br/>
        P: +375 25252150 <br/>
        M: +447522892306 <br/>
        S: amarita.pangea <br/>
        W: www.pangea.global <br/>
    </p>
    <div style="margin-left: 170px; margin-top: 20px">
      <a href="https://www.facebook.com/PangeaLocalizationServices/"><img src="cid:Artboard3@pan" alt="" class="social-image"></a>
      <a href="https://twitter.com/Pangea_Local"><img src="cid:Artboard4@pan" alt="" class="social-image"></a>
      <a href="https://www.pinterest.com/pangealocalizat/"><img src="cid:Artboard5@pan" alt="" class="social-image"></a>
      <a href="https://www.youtube.com/channel/UCKlcUH-8dbg7eZy-nZyDREw"><img src="cid:Artboard6@pan" alt="" class="social-image"></a>
      <a href="https://www.linkedin.com/company/pangea-language-service"><img src="cid:Artboard7@pan" alt="" class="social-image"></a>
      <a href="https://www.instagram.com/pangea_local/"><img src="cid:Artboard8@pan" alt="" class="social-image"></a>
    </div>
    <footer style="max-width: 90%; margin: 20px 0; font-size: 10px; color: #66563D;">
    *Pangea Translation Services LTD (CY) respects your privacy and are committed to protecting your personal data. This is to inform you that your personal data will be used, namely for the purposes of the professional performance of our services only and to stated that Pangea Translation Services LTD (CY) operates under the General Data Protection Regulation ((EU) 2016/679) (GDPR) and the local data protection law. 
    </footer>
    </div>`;

    let mailOptions = {
      from: 'translation@pangea.global', // sender address
      to: `${request.contactEmail}`, // sales@pangea.global list of receivers
      subject: 'Inquiry confirmation from Pangea Localization Services', // Subject line
      text: "plain text", // plain text body
      html: "<b>" + msg + "</b>", // html body
      attachments: [{
        filename: 'logo.png',
        path: './static/logo.png',
        cid: 'logo@pan' //same cid value as in the html img src
        },
        {
          filename: 'Artboard2.jpg',
          path: './static/Artboard2.jpg',
          cid: 'Artboard2@pan' //same cid value as in the html img src
        },
        {
          filename: 'Artboard3.jpg',
          path: './static/Artboard3.jpg',
          cid: 'Artboard3@pan' //same cid value as in the html img src
        },{
          filename: 'Artboard4.jpg',
          path: './static/Artboard4.jpg',
          cid: 'Artboard4@pan' //same cid value as in the html img src
        },{
          filename: 'Artboard5.jpg',
          path: './static/Artboard5.jpg',
          cid: 'Artboard5@pan' //same cid value as in the html img src
        },{
          filename: 'Artboard6.jpg',
          path: './static/Artboard6.jpg',
          cid: 'Artboard6@pan' //same cid value as in the html img src
        },{
          filename: 'Artboard7.jpg',
          path: './static/Artboard8.jpg',
          cid: 'Artboard7@pan' //same cid value as in the html img src
        },{
          filename: 'Artboard8.jpg',
          path: './static/Artboard8.jpg',
          cid: 'Artboard8@pan' //same cid value as in the html img src
        },
      ]
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log('Message sent: %s', info.messageId);
    });

}

module.exports = { sendMailClient };