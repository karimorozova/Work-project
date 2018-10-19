const router = require("express").Router();
const { User, Languages, Projects } = require("../../models");
const { getProject, getUpdatedProject } = require("../../projects/");
const { getOneService } = require("../../services/")
const { sendEmail, clientQuoteEmail, messageForClient, requestMessageForVendor } = require("../../utils/");

router.post("/new-project", async (req, res) => {
    let project = {...req.body};
    project.projectManager = req.session.userId;
    let todayStart = new Date();
    todayStart.setUTCHours(0,0,0,0);
    let todayEnd = new Date(todayStart);
    todayEnd.setUTCHours(23,59,59,0);
    try {
    const todaysProjects = await Projects.find({"createdAt" : { $gte : todayStart, $lt: todayEnd }});
    const nextNumber = (todaysProjects.length < 10) ? '[0' + (todaysProjects.length + 1) + ']': '[' + (todaysProjects.length + 1) + ']';
    project.status = "Draft";
    project.projectId = req.body.dateFormatted + ' ' + nextNumber;
    const newProject = await Projects.create(project);
    const result = await getProject({"_id": newProject.id});
    res.send(result); 
    } catch(err) {
        console.log(err);
        res.status(500).send('Error on creating a project!');
    }
})

router.get("/all-managers", async (req, res) => {
    try {
        const users = await User.find({}, {firstName: 1, lastName: 1});
        res.send(users);
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on getting managers " + err);
    }
})

router.post("/send-quote", async (req, res) => {
    try {
        const project = await getProject({"_id": req.body.id});
        const service = await getOneService({"_id": project.tasks[0].service});
        let quote = {...project._doc};
        quote.service = service.title;
        const message = messageForClient(quote);
        await clientQuoteEmail(project.customer, message);
        const updatedProject = await getUpdatedProject({"_id": project.id}, {status: "Quote sent", isClientOfferClicked: false});
        res.send(updatedProject);
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on sending the Quote");
    }
})

router.post("/vendor-request", async (req, res) => {
    const { projectId, steps } = req.body;
    try {
        const project = await getProject({"_id": projectId});
        for(const step of steps) {
            let requestInfo = {...step};
            requestInfo.projectName = project.projectName;
            requestInfo.industry = project.industry.name;
            requestInfo.brief = project.brief;
            const message = requestMessageForVendor(requestInfo);
            await sendEmail({to: step.vendor.email, subject: 'Request Confirmation'}, message);
            const index = step.vendorsClickedOffer.indexOf(vendor._id);
            if(index !== -1) step.vendorsClickedOffer.splice(index, 1);
        }
        await Projects.updateOne({"_id": projectId}, {steps: steps});
        res.send('Requests has been sent');
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on sending the Request Confirmation");
    }
})

module.exports = router;