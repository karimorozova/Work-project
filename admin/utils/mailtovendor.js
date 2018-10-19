const nodemailer = require('nodemailer');

const vendorMail = function(vendor) {
    // if(request.genBrief) {
    //   detailFile = `<a href='http://admin.pangea.global/reqfiles/${request.id}/written.txt' download target='_self'>written.txt</a>`;
    // }
    // if (request.detailFiles.length > 0) {
    //   for (var i = 0; i < request.detailFiles.length; i++) {
    //     detailFile += "<a href='http://admin.pangea.global/reqfiles/" + request.id + "/";
    //     detailFile += request.detailFiles[i];
    //     detailFile += "' download target='_self'>" + request.detailFiles[i] + "</a><br/>";
    //   }
    // }

    // var referenceFile = "";
    // if (request.refFiles.length > 0) {
    //   for (var i = 0; i < request.refFiles.length; i++) {
    //     referenceFile += "<a href='http://admin.pangea.global/reqfiles/" + request.id + "/";
    //     referenceFile += request.refFiles[i];
    //     referenceFile += "' download target='_self'>" + request.refFiles[i] + "</a><br/>";
    //   }
    // }

    // var targetLangs = "";
    // request.targetLanguages.forEach(element => {
    //   targetLangs += element.lang + ",";
    // });

    let transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com', //in-v3.mailjet.com
      port: 587,
      secure: false, // upgrade later with STARTTLS
      auth: {
        user: 'translation@pangea.global', //2a629a8646758c2140a8aced91f03dcb
        pass: 'LetMeInNow!' //fc72170d536b40480711bfad6ff1a8c1
      }
    });
    var msg = `<li>Hello dear ${vendor.firstName}</li>`;

//     var msg = `<table style="border: 2px solid #66563D;border-collapse: collapse;font-size: 14px;width: 400px;color: #66563D">
//     <thead>
//       <td colspan="2" class="header" style="border: 2px solid #66563D;background-color: #F8D260;font-size: 15px;font-weight: bold;text-align: center;padding: 8px;width: 50%">PROJECT DETAILS</td>
//     </thead>
//     <tbody>
//       <tr>
//         <td class="title" style="border: 0.8px solid rgba(102, 86, 61, 0.51);padding: 8px;width: 50%;font-weight: bold;border-right: 2px solid rgba(102, 86, 61, 0.51)">Service Type:</td>
//         <td style="border: 0.8px solid rgba(102, 86, 61, 0.51);padding: 8px;width: 50%">${request.service.title}</td>
//       </tr>
//       <tr>
//         <td class="title" style="border: 0.8px solid rgba(102, 86, 61, 0.51);padding: 8px;width: 50%;font-weight: bold;border-right: 2px solid rgba(102, 86, 61, 0.51)">Source Language:</td>
//         <td style="border: 0.8px solid rgba(102, 86, 61, 0.51);padding: 8px;width: 50%">${request.sourceLanguage.lang}</td>
//       </tr>
//       <tr>
//         <td class="title" style="border: 0.8px solid rgba(102, 86, 61, 0.51);padding: 8px;width: 50%;font-weight: bold;border-right: 2px solid rgba(102, 86, 61, 0.51)">Target Languages:</td>
//         <td style="border: 0.8px solid rgba(102, 86, 61, 0.51);padding: 8px;width: 50%">${targetLangs}</td>
//       </tr>
//       <tr>
//         <td class="title" style="border: 0.8px solid rgba(102, 86, 61, 0.51);padding: 8px;width: 50%;font-weight: bold;border-right: 2px solid rgba(102, 86, 61, 0.51)">Industry</td>
//         <td style="border: 0.8px solid rgba(102, 86, 61, 0.51);padding: 8px;width: 50%">${request.industry}</td>
//       </tr>
//       <tr>
//         <td class="title" style="border: 0.8px solid rgba(102, 86, 61, 0.51);padding: 8px;width: 50%;font-weight: bold;border-right: 2px solid rgba(102, 86, 61, 0.51)">Reference Files:</td>
//         <td style="border: 0.8px solid rgba(102, 86, 61, 0.51);padding: 8px;width: 50%">${referenceFile}</td>
//       </tr>
//       <tr>
//         <td class="title" style="border: 0.8px solid rgba(102, 86, 61, 0.51);padding: 8px;width: 50%;font-weight: bold;border-right: 2px solid rgba(102, 86, 61, 0.51)">Files:</td>
//         <td style="border: 0.8px solid rgba(102, 86, 61, 0.51);padding: 8px;width: 50%">${detailFile}</td>
//       </tr>
//       <tr>
//         <td class="title" style="border: 0.8px solid rgba(102, 86, 61, 0.51);padding: 8px;width: 50%;font-weight: bold;border-right: 2px solid rgba(102, 86, 61, 0.51)">Brief:</td>
//         <td style="border: 0.8px solid rgba(102, 86, 61, 0.51);padding: 8px;width: 50%">${request.brief}</td>
//       </tr>
//       <tr>
//         <td class="title" style="border: 0.8px solid rgba(102, 86, 61, 0.51);padding: 8px;width: 50%;font-weight: bold;border-right: 2px solid rgba(102, 86, 61, 0.51)">Deadline:</td>
//         <td style="border: 0.8px solid rgba(102, 86, 61, 0.51);padding: 8px;width: 50%">${request.date}</td>
//       </tr>
//     </tbody>
// </table>`;
    
    let mailOptions = {
      from: 'translation@pangea.global', // sender address
      to: `${vendor.email}`, // pm@pangea.global list of receivers
      subject: `Quote Details`, // Subject line
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

module.exports = { vendorMail };
