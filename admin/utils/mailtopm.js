const nodemailer = require('nodemailer');

const pmMail = function(project, client, user) {
    
    let transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com', //in-v3.mailjet.com
      port: 587,
      secure: false, // upgrade later with STARTTLS
      auth: {
        user: 'translation@pangea.global',
        pass: '@Png2022!!'
      }
    });
    const msg = `<li>Dear ${user.firstName}</li>` + `<p>The Quote with Id ${project.projectId} was rejected ` + `by the client ${client.name}</p>`;

    let mailOptions = {
      from: 'translation@pangea.global', // sender address
      to: `${user.email}`, // pm@pangea.global list of receivers
      subject: `Quote Details ${project.projectId}`, // Subject line
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

module.exports = { pmMail };
