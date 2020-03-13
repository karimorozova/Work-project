const router = require('express').Router();
const { Projects } = require('../models');
const { getProject, updateProjectStatus } = require('../projects');
const { emitter } = require('../events');
const { getProjectManageToken } = require("../middleware");

router.get('/acceptquote', getProjectManageToken, async (req, res) => {
    const {to: mailDate, projectId } = req.query;
    const date = new Date().getTime();
    const expiry = date - mailDate;
    try {
        if(expiry > 900000) {
            res.set('Content-Type', 'text/html');
            res.send(`<body onload="javascript:setTimeout('self.close()',5000);"><p>Sorry! The link is already expired.</p></body>`)
        } else {
            const project = await getProject({"_id": projectId});
            if(project.isClientOfferClicked || project.status !== "Quote sent") {
                res.set('Content-Type', 'text/html');
                return res.send(`<body onload="javascript:setTimeout('self.close()',5000);"><p>Sorry. Link is not valid anymore.</p></body>`)
            }
            const status = project.isStartAccepted ? "Started" : "Approved";
            await updateProjectStatus(projectId, status);
            await Projects.updateOne({"_id": projectId}, {$set: {isClientOfferClicked: true}});
            emitter.emit('projectApprovedNotification', project);
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
    const {to: mailDate, projectId } = req.query;
    const date = new Date().getTime();
    const expiry = date - mailDate;
    try {
        if(expiry > 900000) {
            res.set('Content-Type', 'text/html')
            res.send(`<body onload="javascript:setTimeout('self.close()',5000);"><p>Sorry! The link is already expired.</p></body>`)
        } else {
            const project = await getProject({"_id": projectId});
            if(project.isClientOfferClicked || project.status !== "Quote sent") {
                res.set('Content-Type', 'text/html');
                return res.send(`<body onload="javascript:setTimeout('self.close()',5000);"><p>Sorry. Link is not valid anymore.</p></body>`)
            }
            const client = {...project.customer._doc, id: project.customer.id};
            emitter.emit('projectRejectedNotification', project);
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

router.get('/step-decision', getProjectManageToken, async (req, res) => {
    const { decision, vendorId, projectId, stepId, to } = req.query;
    const date = Date.now();
    try {
        if((date - +to) > 900000) {
            res.set('Content-Type', 'text/html')
            res.send(`<body onload="javascript:setTimeout('self.close()',5000);"><p>Sorry! The link is already expired.</p></body>`)
        } else {
            const project = await getProject({"_id": projectId});
            let steps = [...project.steps];
            let index = steps.findIndex(item => item.stepId === stepId);
            if(steps[index].vendorsClickedOffer.indexOf(vendorId) !== -1) {
                res.set('Content-Type', 'text/html');
                return res.send(`<body onload="javascript:setTimeout('self.close()',5000);"><p>Sorry. You've already made your decision.</p></body>`)
            }
            emitter.emit('stepAcceptAction', {project, index, vendorId, decision});
            res.set('Content-Type', 'text/html')
            res.send(`<body onload="javascript:setTimeout('self.close()',5000);"><p>Thank you.</p></body>`)
        }
    } catch(err) {
        console.log(err);
        res.set('Content-Type', 'text/html')
        res.send(`<body onload="javascript:setTimeout('self.close()',5000);"><p>Sorry. Acception failed! Try again later.</p></body>`)
    }
})

module.exports = router;
