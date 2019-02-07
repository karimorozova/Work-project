const router = require("express").Router();
const { User, Languages, Projects } = require("../../models");
const { getProject, updateProject, changeProjectProp, cancelTasks, cancelSteps } = require("../../projects/");
const { getOneService } = require("../../services/");
const { sendEmail, clientQuoteEmail, messageForClient, stepVendorsRequestSending, sendEmailToContact } = require("../../utils/");

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
        res.status(500).send("Error on getting managers ");
    }
})

router.put("/project-option", async (req, res) => {
    const { projectId, property } = req.body;
    try {
        const result = await changeProjectProp(projectId, property);
        res.send(result);
    } catch(err) {
        res.status(500).send("Internal server error / Cannot change Project's property");
    }
})

router.put("/project-status", async (req, res) => {
    const { id, status } = req.body;
    try {
        const result = await updateProject({"_id": id}, { status });
        res.send(result);
    } catch(err) {
        res.status(500).send("Internal server error / Cannot change Project's status");
    }
})

router.get("/quote-message", async (req, res) => {
    const { projectId } = req.query;
    try {
        const project = await getProject({"_id": projectId});
        const service = await getOneService({"_id": project.tasks[0].service});
        let quote = {...project._doc, id: project.id};
        quote.service = service.title;
        const message = messageForClient(quote);
        res.send({message});
    } catch(err) {
        res.status(500).send("Error on getting quote message");
    }
})

router.post("/send-quote", async (req, res) => {
    const { id, message } = req.body;
    try {
        const project = await getProject({"_id": id});
        const subject = project.isUrgent ? "URGENT! Quote Details" : "Quote Details";
        await clientQuoteEmail({...project.customer._doc, subject: subject}, message);
        const updatedProject = await updateProject({"_id": project.id}, {status: "Quote sent", isClientOfferClicked: false});
        res.send(updatedProject);
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on sending the Quote");
    }
})

router.post("/contact-mailing", async (req, res) => {
    const { projectId, contact } = req.body;
    try {
        const project = await getProject({"_id": projectId});
        await sendEmailToContact(project, contact);
        res.send('Email has been sent')
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on contact-mailing");
    }
 })

router.post("/vendor-request", async (req, res) => {
    const { projectId, checkedSteps } = req.body;
    try {
        const project = await getProject({"_id": projectId});
        const updatedSteps = await stepVendorsRequestSending(project, checkedSteps);
        const updatedProject = await updateProject({"_id": project.id}, {steps: updatedSteps});
        res.send(updatedProject);
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on sending the Request Confirmation");
    }
})

router.post("/cancel-tasks", async (req, res) => {
    const { tasks, projectId } = req.body;
    try {
        const project = await getProject({"_id": projectId});
        const { changedTasks, changedSteps } = cancelTasks(tasks, project);
        const updatedProject = await updateProject({"_id": projectId}, {tasks: changedTasks, steps: changedSteps});
        res.send(updatedProject);
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on cancelling tasks / cancel-tasks");
    }
})

router.post("/cancel-steps", async (req, res) => {
    const { checkedSteps, projectId } = req.body;
    try {
        const project = await getProject({"_id": projectId});
        const { changedSteps, changedTasks } = cancelSteps(checkedSteps, project);
        const updatedProject = await updateProject({"_id": projectId}, {tasks: changedTasks, steps: changedSteps});
        res.send(updatedProject);
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on cancelling steps / cancel-steps");
    }
})

module.exports = router;