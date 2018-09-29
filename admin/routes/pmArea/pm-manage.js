const router = require("express").Router();
const upload = require("../../utils/uploads");
const moveFile = require("../../utils/moveFile");
const { Users, Languages, Projects } = require("../../models");

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
    const result = await Projects.create(project);
    res.send(result); 
    } catch(err) {
        console.log(err);
        res.send('Error on creating a project!' + err);
    }
})

module.exports = router;