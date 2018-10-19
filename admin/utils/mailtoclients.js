const nodemailer = require('nodemailer');

const clientMail = function(project, client) {
    let acceptQuote = "";
    let declineQuote = "";
    let langPairs = "";
    const date = new Date().getTime();
    let totalCost = 56;
    let expiryDate = new Date(date + 60000);
    for(let target of project.targetLanguages) {
      langPairs += project.sourceLanguage.symbol + " >> " + target.symbol + "; "
    }
    acceptQuote = '<a href=' + `http://localhost:3001/clientsapi/acceptquote?projectId=${project._id}&to=${date}` + ` target="_blank" style="color: orange;">I accept - ${project.projectId}, ${totalCost} &euro;</a>`
    declineQuote = '<a href=' + `http://localhost:3001/clientsapi/declinequote?projectId=${project._id}&to=${date}` + ` target="_blank" style="color: orange;">I reject - ${project.projectId}, ${totalCost} &euro;</a>`
    
    let msg = `<div class="wrapper" style="width: 960px;border: 1px solid rgb(129, 129, 129);">
    <h3 class="clientName" style="margin-top: 0;padding: 30px;background-color: rgb(250, 250, 250);">Dear ${client.contactName},</h3>
    <div class="all-info" style="padding: 0 15px 0 30px;">
        <p class="description" style="font-size: 18px;">
            Please find attached Quote(s).
        </p>
        <p>
            By clicking on one of the links below, you can accept or reject out offer.
        </p>
        <h3 class="detailsTitle">Quote Details</h3>
        <table class="details">
            <tr>
                <td>Quote number:</td>
                <td>${project.projectId}</td>
            </tr>
            <tr>
                <td>Quote name:</td>
                <td>${project.projectName}</td>
            </tr>
            <tr>
                <td>Service:</td>
                <td>${project.service}</td>
            </tr>
            <tr>
                <td>Estimated delivery date:</td>
                <td></td>
            </tr>
            <tr>
                <td>Languages:</td>
                <td>${langPairs}</td>
            </tr>
            <tr>
                <td>Specializtion:</td>
                <td>${project.industry}</td>
            </tr>
            <tr>
                <td>Amount:</td>
                <td>${totalCost} &euro;</td>
            </tr>
        </table>
        <p class="description" style="font-size: 18px;">
            This quote expires on: ${expiryDate}
        </p>
            <p class="link" style="color: orange;">${acceptQuote}</p>
            <p>or</p>
            <p class="link" style="color: orange;">${declineQuote}</p>
        <p class="description" style="font-size: 18px;">
            Please note that by accepting the quote, the  project will start automatically.
        </p>
        <p>
            In case of any questions, please do not hesitate to contact us.
        </p>
        <h4 style="width: 35px;border-bottom: 1px solid rgb(29, 29, 29);">T&C:</h4>
        <ol style="padding-left: 0;">
            <li>The rstimated delivery date is only applicable if you accept the quote on the day of receipt. If not, the estimated date willl vary.</li>
            <li>Should you agree to a QA service, we cannot accept responsibility if you fail to send us the finished files upon completion. Please note the QA service expires in 30 days after the quote approval.</li>
        </ol>
        <h2 class="contact" style="border-bottom: 1px solid rgb(29, 29, 29);">Contact Pangea TRanslation Services (Cyprus) LTD</h2>
        <a href="http://pangea.global" target="_blank"><img src="cid:logo@pan" style="width: 50%; margin-left: 145px;"></a>
    </div>
</div>`;
    
    let mailOptions = {
      from: 'translation@pangea.global', // sender address
      to: `${client.email}`, // pm@pangea.global list of receivers
      subject: `Quote Details`, // Subject line
      text: "plain text", // plain text body
      html: msg, // html body
      attachments: [{
        filename: 'logo.png',
        path: './static/logo.png',
        cid: 'logo@pan' //same cid value as in the html img src
        }
      ]
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log('Message sent: %s', info.messageId);

    });
}



module.exports = { clientMail };
