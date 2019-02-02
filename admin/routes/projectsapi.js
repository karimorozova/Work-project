const router = require('express').Router();
const { pmMail } = require('../utils/');
const { Projects, User } = require('../models');
const { getProject } = require('../projects');
const { emitter } = require('../events');
const  { getProjectManageToken } = require("../middleware");

router.get('/acceptquote', getProjectManageToken, async (req, res) => {
    const mailDate = req.query.to;
    const date = new Date().getTime();
    const expiry = date - mailDate;
    const projectId = req.query.projectId;
    try {
        if(expiry > 900000) {
            res.set('Content-Type', 'text/html');
            res.send(`<body onload="javascript:setTimeout('self.close()',5000);"><p>Sorry! The link is already expired.</p></body>`)
        } else {
            const project = await getProject({"_id": projectId});
            if(project.isClientOfferClicked) {
                res.set('Content-Type', 'text/html');
                return res.send(`<body onload="javascript:setTimeout('self.close()',5000);"><p>Sorry. You've already made your decision.</p></body>`)
            }
            await Projects.updateOne({"_id": projectId}, {$set: {status: 'Started', isClientOfferClicked: true}});
            emitter.emit('managersNotificationEmail', project);
            res.set('Content-Type', 'text/html')
            res.send(`<body onload="javascript:setTimeout('self.close()',5000);"><p>Thank you. We'll contact you as soon as possible.</p></body>`)
        }
    } catch(err) {
            console.log(err);
            res.set('Content-Type', 'text/html')
            res.send(`<body onload="javascript:setTimeout('self.close()',5000);"><p>Sorry. Acception failed! Try again later.</p></body>`)
        }    
})

router.get('/declinequote', async (req, res) => {
    const mailDate = req.query.to;
    const date = new Date().getTime();
    const expiry = date - mailDate;
    const projectId = req.query.projectId;
    try {
        if(expiry > 900000) {
            res.set('Content-Type', 'text/html')
            res.send(`<body onload="javascript:setTimeout('self.close()',5000);"><p>Sorry! The link is already expired.</p></body>`)
        } else {
            const project = await getProject({"_id": projectId});
            if(project.isClientOfferClicked) {
                res.set('Content-Type', 'text/html');
                return res.send(`<body onload="javascript:setTimeout('self.close()',5000);"><p>Sorry. You've already made your decision.</p></body>`)
            }
            const client = {...project.customer._doc, id: project.customer.id};
            const user = await User.findOne({"_id": client.projectManager._id});
            await pmMail(project, client, user);
            await Projects.updateOne({"_id": projectId}, {$set: {status: "Rejected", isClientOfferClicked: true}});
            res.set('Content-Type', 'text/html')
            res.send(`<body onload="javascript:setTimeout('self.close()',5000);"><p>Thank you! We'll contact you if any changes.</p></body>`)
        }
    } catch(err) {
        console.log(err);
        res.set('Content-Type', 'text/html')
        res.send(`<body onload="javascript:setTimeout('self.close()',5000);"><p>Sorry. Try again later.</p></body>`)
    }
})

module.exports = router;
