const router = require("express").Router();
const { User, Clients } = require("../../models");
const { getClient } = require("../../clients");
const { getProject, createProject, updateProject, changeProjectProp, getProjectAfterCancelTasks, updateProjectStatus, 
    setStepsStatus, getMessage, getAfterApproveFile, getDeliverablesLink, sendTasksQuote, getAfterReopenSteps } = require("../../projects/");
const { upload, moveFile, archiveFile, clientQuoteEmail, stepVendorsRequestSending, sendEmailToContact } = require("../../utils/");
const { getProjectAfterApprove, setTasksDeliveryStatus, getAfterTasksDelivery } = require("../../delivery");

router.get("/project", async (req, res) => {
    const { id } = req.query;
    try {
        const project = await getProject({"_id": id});
        res.send(project);
    } catch(err) {
        console.log(err);
        console.log("Error on getting Project");
    }
})

router.get("/language-pairs", async (req, res) => {
    const { customerId } = req.query;
    try {
        const customer = await getClient({"_id": customerId});
        const { languageCombinations } = customer;
        res.send(languageCombinations);
    } catch(err) {
        console.log(err);
        console.log("Error on getting Project");
    }
})

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
        console.log(err);
        res.status(500).send("Internal server error / Cannot change Project's property");
    }
})

router.put("/project-status", async (req, res) => {
    const { id, status } = req.body;
    try {
        const result = await updateProjectStatus(id, status);
        res.send(result);
    } catch(err) {
        console.log(err);
        res.status(500).send("Internal server error / Cannot change Project's status");
    }
})

router.get("/quote-message", async (req, res) => {
    const { projectId } = req.query;
    try {
        const message = await getMessage(projectId, "quote");
        res.send({message});
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on getting quote message");
    }
})

router.get("/project-details", async (req, res) => {
    const { projectId } = req.query;
    try {
        const message = await getMessage(projectId, "details");
        res.send({message});
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on getting project details");
    }
})

router.post("/project-details", async (req, res) => {
    const { id, message } = req.body;
    try {
        const project = await getProject({"_id": id});
        await clientQuoteEmail({...project.customer._doc, subject: `Project details (ID C006, ${project.projectId})`}, message);
        res.send("Project details sent");
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on sending project details");
    }
})

router.post("/send-quote", async (req, res) => {
    const { id, message } = req.body;
    try {
        const project = await getProject({"_id": id});
        const subject = project.isUrgent ? "URGENT! Quote Details" : "Quote Details";
        await clientQuoteEmail({...project.customer._doc, subject: `${subject} (ID C001, ${project.projectId})` }, message);
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
        const updatedProject = await getProjectAfterCancelTasks(tasks, project);
        res.send(updatedProject);
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on cancelling tasks / cancel-tasks");
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

router.post("/steps-reopen", async (req, res) => {
    const { steps } = req.body;
    try {
        const project = await getProject({"steps._id": steps[0]._id});
        const updateProject = await getAfterReopenSteps(steps, project);
        res.send(updateProject);
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on reopening steps");
    }
})

router.post("/approve-files", async (req, res) => {
    const { taskId, jobId, isFileApproved } = req.body;
    try {
        const updatedProject = await getAfterApproveFile({
            taskId, jobId, isFileApproved
        })
        res.send(updatedProject);
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on approve files");
    }
})

router.post("/target", upload.fields([{name: "targetFile"}]), async (req, res) => {
    const fileData = {...req.body};
    try {
        const files = req.files["targetFile"];
        const file = files[0];
        const fileNameParts = file.filename.split('.');
        if(fileNameParts.slice(-1).toString() === 'zip') {
            await moveFile(files[0], `./dist${fileData.path}`);
        } else {
            await archiveFile({outputPath: `./dist${fileData.path}`, originFile: file});
        }
        res.send("");
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on uploading target file");
    }
})

router.post("/tasks-approve-notify", async (req, res) => {
    const { taskIds, isDeliver } = req.body;
    try {
        const project = await getProject({"tasks.taskId": taskIds[0]});
        const updatedProject = await getProjectAfterApprove({taskIds, project, isDeliver});
        res.send(updatedProject);
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on approving deliverable");
    }
})

router.post("/tasks-approve", async (req, res) => {
    const { taskIds } = req.body;
    try {
        const project = await getProject({"tasks.taskId": taskIds[0]});
        const updatedProject = await setTasksDeliveryStatus({taskIds, project, status: "Ready for Delivery"});
        res.send(updatedProject);
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on approving deliverable");
    }
})

router.get("/deliverables", async (req, res) => {
    const { taskId } = req.query;
    try {
        const project = await getProject({"tasks.taskId": taskId});
        const task = project.tasks.find(item => item.taskId === taskId);
        const link = await getDeliverablesLink({taskId, projectId: project.id, jobs: task.xtmJobs});
        res.send({link});
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on downloading deliverables");
    }
})

router.post("/deliver", async (req, res) => {
    const { tasks } = req.body;
    try {
        const updatedProject = await getAfterTasksDelivery(tasks);
        res.send(updatedProject);
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on delivering tasks");
    }
})

router.post("/tasks-quote", async (req, res) => {
    const { tasks } = req.body;
    try {
        await sendTasksQuote(tasks);
        res.send('Quote sent');
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on sending tasks quote");
    }
})

module.exports = router;
