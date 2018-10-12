const router = require("express").Router();
const upload = require("../../utils/uploads");
const moveFile = require("../../utils/moveFile");
const { User, Languages, Projects } = require("../../models");
const { getProject } = require("../../projects/");
const { getOneService } = require("../../services/")
const { clientQuoteEmail, messageForClient } = require("../../utils/");

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
        const clientMail = await clientQuoteEmail(project.customer, message);
        res.send(clientMail);
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on sending a Quote " + err);
    }
})

router.post("/vendor-request", async (req, res) => {
    res.send('Request has been sent');
})

module.exports = router;