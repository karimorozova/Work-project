const router = require("express").Router();
const { User, Clients, Projects } = require("../../models");
const { getProject, createProject, updateProject, changeProjectProp, cancelTasks, cancelSteps, updateProjectStatus, notifyVendors, setStepsStatus } = require("../../projects/");
const { getOneService } = require("../../services/");
const { sendEmail, clientQuoteEmail, messageForClient, stepVendorsRequestSending, sendEmailToContact } = require("../../utils/");

router.post("/new-project", async (req, res) => {
    let project = {...req.body};
    const client = await Clients.findOne({"_id": project.customer});
    project.projectManager = client.projectManager._id;
    try {
        const result = await createProject(project);
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
        const result = await updateProjectStatus(id, status);
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
        const { changedTasks, changedSteps, checkedSteps } = cancelTasks(tasks, project);
        await notifyVendors(checkedSteps);
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
        await notifyVendors(checkedSteps);
        const updatedProject = await updateProject({"_id": projectId}, {tasks: changedTasks, steps: changedSteps});
        res.send(updatedProject);
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on cancelling steps / cancel-steps");
    }
})

router.post("/step-status", async (req, res) => {
    const { id, status, steps } = req.body;
    try {
        const project = await getProject({"_id": id});
        const updatedSteps = setStepsStatus({steps, status, project});
        const updatedProject = await updateProject({"_id": id}, {steps: updatedSteps});
        res.send(updatedProject);
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on setting step status");
    }
})

module.exports = router;
