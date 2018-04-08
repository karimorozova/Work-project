const nodemailer = require('nodemailer');

const mailhandler = {
    sendMail(request) {
        var msg = "<b>" + 
            "Suggested Deadline : " + request.date +"<br/>" + 
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
            if(request.detailFiles.length > 0)
            {
                msg += "Detail File : ";
                for(var i=0; i < request.detailFiles.length; i++){
                    msg += "<a href='http://admin.pangea.global:81/uploads/";
                    msg += request.detailFiles[i].filename;
                    msg += "' download target='_self'>"+ request.detailFiles[i].filename +"</a><br/>";
                }
            }
            msg += "Ref File : <a href='http://admin.pangea.global:81/uploads/" + request.refFiles[0].filename + "' download target='_self'>"+ request.refFiles[0].filename +"</a><br/>";
            
            
            // Add targetLanguages
            msg +="Target Languages : ";
            request.targetLanguages.forEach(element => {
                msg += element.lang + ",";
            });
            msg +="<br/>";
            msg += "Brief : " + request.brief + "<br/>";
            msg += "Source languages : " + request.sourceLanguage.lang + "<br/>"; 

        let transporter = nodemailer.createTransport({
            host: 'smtp.yandex.ru',
            port: 465,
            secure: true, // upgrade later with STARTTLS
            auth: {
                user: 'ccvt@sochi.com',
                pass: 'Ivideon#2017'
            }
        });
        
        let mailOptions = {
            from: 'ccvt@sochi.com', // sender address
            to: 'm.s.ignat@gmail.com', // list of receivers
            subject: 'Pangea test', // Subject line
            text: "plain text", // plain text body
            html: "<b>" + msg +"</b>"// html body
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