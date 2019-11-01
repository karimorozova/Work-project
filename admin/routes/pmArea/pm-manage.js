const router = require("express").Router();
const { User, Clients } = require("../../models");
const { getClient } = require("../../clients");
const { setDefaultStepVendors, updateProjectCosts } = require("../../сalculations/wordcount");
const { getAfterPayablesUpdated } = require("../../сalculations/updates");
const { getProject, createProject, updateProject, getProjectAfterCancelTasks, updateProjectStatus, getProjectWithUpdatedFinance, manageDeliveryFile,
    setStepsStatus, getMessage, getAfterApproveFile, getDeliverablesLink, sendTasksQuote, getAfterReopenSteps, getProjectAfterFinanceUpdated } = require("../../projects/");
const { upload, moveFile, archiveFile, clientQuoteEmail, stepVendorsRequestSending, sendEmailToContact, stepReassignedNotification } = require("../../utils/");
const { getProjectAfterApprove, setTasksDeliveryStatus, getAfterTasksDelivery } = require("../../delivery");
const  { getStepsWithFinanceUpdated, reassignVendor } = require("../../projectSteps");
const { getTasksWithFinanceUpdated } = require("../../projectTasks");
const { getClientRequest, updateClientRequest, addRequestFile, removeRequestFile, removeRequestFiles } = require("../../clientRequests");

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

router.get("/request", async (req, res) => {
    const { id } = req.query;
    try {
        const request = await getClientRequest({"_id": id});
        res.send(request);
    } catch(err) {
        console.log(err);
        console.log("Error on getting Request");
    }
})

router.get("/language-pairs", async (req, res) => {
    const { customerId } = req.query;
    try {
        const customer = await getClient({"_id": customerId});
        const { monoRates, wordsRates, hoursRates } = customer;
        res.send({ monoRates, wordsRates, hoursRates });
    } catch(err) {
        console.log(err);
        console.log("Error on getting Project");
    }
})

router.post("/new-project", async (req, res) => {
    let project = {...req.body};
    const client = await Clients.findOne({"_id": project.customer});
    project.projectManager = client.projectManager._id;
    project.accountManager = client.accountManager._id;
    try {
        const result = await createProject(project);
        res.send(result);
    } catch(err) {
        console.log(err);
        res.status(500).send('Error on creating a project!');
    }
})

router.get("/all-managers", async (req, res) => {
    const { groupFilters } = req.query;
    try {
        const users = await User.find({}, {firstName: 1, lastName: 1, group: 1}).populate("group");
        const filteredUsers = groupFilters ? users.filter(item => groupFilters.split(",").indexOf(item.group.name) !== -1) : users;
        res.send(filteredUsers);
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on getting managers ");
    }
})

router.put("/project-prop", async (req, res) => {
    const { projectId, prop, value } = req.body;
    try {
        const result = await updateProject({"_id": projectId}, {[prop]: value});
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

router.put("/project-date", async (req, res) => {
    const { projectId, date } = req.body;
    try {
        const result = await updateProject({"_id": projectId}, date);
        res.send(result);
    } catch(err) {
        console.log(err);
        res.status(500).send("Internal server error / Cannot change Project's deadline");
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

router.post("/vendor-assignment", async (req, res) => {
    const { step } = req.body;
    try {
        const project = await getProject({"steps._id": step._id});
        if(step.vendor) {
            await stepReassignedNotification(project, step);
        }
        await stepVendorsRequestSending(project, [step]);
        res.send('messages sent');
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on sending emails to vendors");
    }
})

router.post("/reassign-vendor", async (req, res) => {
    const reassignData = {...req.body};
    try {
        const project = await getProject({"steps._id": reassignData.step._id});
        const { steps, tasks } = await reassignVendor(project, reassignData);
        const updatedProject = await getProjectAfterFinanceUpdated({project, steps, tasks});
        res.send(updatedProject);
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on sending emails to vendors");
    }
})

router.get('/costs', async (req, res) => {
    const { projectId } = req.query;
    try {
      let project = await getProject({"_id": projectId});
      let projectToUpdate = await getProjectWithUpdatedFinance(project);
      const { steps, tasks } = await setDefaultStepVendors(projectToUpdate);
      const updatedProject = await updateProjectCosts({...projectToUpdate, steps, tasks});
      res.send(updatedProject);
    } catch(err) {
      console.log(err);
      res.status(500).send('Error on getting costs');
    }
})

router.post('/step-payables', async (req, res) => {
    let { projectId, step, index } = req.body;
    try {
        const updatedProject = await getAfterPayablesUpdated({ projectId, step, index});
        res.send(updatedProject);
    } catch(err) {
        console.log(err);
        res.status(500).send('Error on getting step payables');
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
    const { taskId, jobId, isFileApproved,path } = req.body;
    try {
        const updatedProject = await getAfterApproveFile({
            taskId, jobId, isFileApproved, path
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
        const project = await getProject({"tasks.taskId": fileData.taskId});
        const files = req.files["targetFile"];
        const { tasks, steps } = await manageDeliveryFile({fileData, project, file: files[0]});
        const updatedProject = await updateProject({"_id": project.id}, { tasks, steps });
        res.send(updatedProject);
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
        const taskFiles = task.xtmJobs || task.targetFiles;
        const link = await getDeliverablesLink({
            taskId, projectId: project.id, taskFiles, unit: task.service.calculationUnit
        });
        if(link) {
            await Projects.updateOne({"tasks.taskId": taskId}, {"tasks.$.deliverables": link});
        }
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

router.post("/step-finance", async (req, res) => {
    const { step } = req.body;
    try {
        const project = await getProject({"steps._id": step._id});
        const steps = getStepsWithFinanceUpdated(step, project);
        const tasks = getTasksWithFinanceUpdated(step, {...project._doc, steps});
        const updatedProject = await getProjectAfterFinanceUpdated({project, steps, tasks});
        res.send(updatedProject);
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on changing Step finance");
    }
})

router.post("/request-file", upload.fields([{name: "newFile"}]) ,async (req, res) => {
    const { id, oldFile } = req.body;
    const files = req.files["newFile"];
    const existingFile = JSON.parse(oldFile);
    const prop = existingFile.type === 'Source File' ? "sourceFiles" : "refFiles";
    try {
        let request = await getClientRequest({"_id": id});
        const requestFiles = await addRequestFile({request, files, existingFile, prop});
        request[prop] = requestFiles;
        await request.save();
        res.send(request);
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on saving request file");
    }
})

router.post("/remove-request-file", async (req, res) => {
    const { id, prop, path } = req.body;
    try {
        let request = await getClientRequest({"_id": id});
        request[prop] = await removeRequestFile({path, files: request[prop]});
        await request.save();
        res.send(request);
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on removing request file");
    }
})

router.post("/delete-request-files", async (req, res) => {
    const { id, sourceFiles, refFiles } = req.body;
    try {
        let request = await getClientRequest({"_id": id});
        if(sourceFiles.length) {
            request.sourceFiles = await removeRequestFiles(sourceFiles, request.sourceFiles);
        }
        if(refFiles.length) {
            request.refFiles = await removeRequestFiles(refFiles, request.refFiles);
        }
        await request.save();
        res.send(request);
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on removing request file");
    }
})

router.post("/file-approvement", async (req, res) => {
    const { id, file, prop } = req.body;
    try {
        let request = await getClientRequest({"_id": id});
        request[prop] = request[prop].map(item => {
            if(item.fileName === file.fileName && item.path === file.path) {
                return {...item, isApproved: file.isApproved}
            }
            return item;
        })
        await request.save();
        res.send(request);
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on approvement of request file");
    }
})

router.post("/prop-approvement", async (req, res) => {
    const { id, prop } = req.body;
    try {
        let request = await getClientRequest({"_id": id});
        request[prop] = !request[prop];
        request.save();
        res.send(request);
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on approvement of request file");
    }
})

router.post("/request-value", async (req, res) => {
    const { id, prop, value } = req.body;
    let updateQuery = {[prop]: value};
    if(prop === 'accountManager') {
        updateQuery.isAssigned = false;
    }
    try {
        const updatedRequest = await updateClientRequest({"_id": id}, updateQuery);
        res.send(updatedRequest);
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on saving request property value");
    }
})

router.post("/project-value", async (req, res) => {
    const { id, prop, value } = req.body;
    try {
        const updatedProject = await updateProject({"_id": id}, {[prop]: value});
        res.send(updatedProject);
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on saving project property value");
    }
})

module.exports = router;
