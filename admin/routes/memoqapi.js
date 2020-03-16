const router = require('express').Router();
const { upload } = require('../utils');
const { User } = require('../models');
const { downloadCompletedFiles } = require("../projects");
const { getMemoqAllProjects, createMemoqProjectWithTemplate, getProjectTranslationDocs, getProjectAnalysis, getProjectUsers, getMemoqFileId } = require("../services/memoqs/projects");
const { moveMemoqFileToProject, addProjectFile, exportMemoqFile, getMemoqFileChunks } = require("../services/memoqs/files");
const { getMemoqTemplates} = require("../services/memoqs/resources");
const { storeFiles } = require("../projects/files");
const { getMemoqUsers } = require("../services/memoqs/users");
const { updateProjectMetrics } = require("../projects/metrics");

router.get('/users', async (req, res) => {
    try {
        const result = await getMemoqUsers();
        res.json(result);
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on getting memoQ users");
    }
})

router.get('/userId', async (req, res) => {
    const { userId } = req.query;
    try {
        const user = await User.findOne({_id: userId});
        const memoqUsers = await getMemoqUsers();
        const creatorUser = memoqUsers.find(item => item.email === user.email);
        res.send({creatorUserId: creatorUser ? creatorUser.id : "" });
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on getting memoQ user");
    }
})

router.get('/templates', async (req, res) => {
    try {
        const unSorted = await getMemoqTemplates();
        const result = unSorted.sort((a,b) => a.name > b.name ? 1 : -1);
        res.json(result);
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on getting memoQ templates");
    }
})

router.post('/memoq-project', upload.fields([{name: 'sourceFiles'}, {name: 'refFiles'}]), async (req, res) => {
    let tasksInfo = {...req.body};
    try {
        if(tasksInfo.isRequest) {
            tasksInfo.memoqProjectId = await createMemoqProjectWithTemplate(tasksInfo);
            return res.send({ tasksInfo });
        }
        if(tasksInfo.source) {
            tasksInfo.source = JSON.parse(tasksInfo.source);
        }
        tasksInfo.targets = JSON.parse(tasksInfo.targets);
        tasksInfo.service = JSON.parse(tasksInfo.service);
        tasksInfo.stepsDates = tasksInfo.stepsDates ? JSON.parse(tasksInfo.stepsDates) : [];
        const { sourceFiles, refFiles } = req.files;
        tasksInfo.translateFiles = await storeFiles(sourceFiles, tasksInfo.projectId);
        tasksInfo.referenceFiles = refFiles ? await storeFiles(refFiles, tasksInfo.projectId) : [];
        tasksInfo.memoqProjectId = await createMemoqProjectWithTemplate(tasksInfo);
        res.send({ tasksInfo });
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on creating a Project in memoQ");
    }
})

router.post('/add-project-file', async (req, res) => {
    const { memoqProjectId, filePath } = req.body;
    try {
        await addProjectFile(memoqProjectId, filePath);
        res.send("done");
    } catch(err) {
        console.log(err);
        res.status(500).send(err);
    }
})

router.get('/projects', async (req, res) => {
    try {
        const result = await getMemoqAllProjects();
        res.json(result);
    } catch(err) {
        console.log(err);
        res.status(500).send(err);
    }
})

router.get('/project-users', async (req, res) => {
    const { id } = req.query;
    try {
        const result = await getProjectUsers(id);
        res.send(result);
    } catch(err) {
        console.log(err);
        res.status(500).send(err);
    }
})

router.get('/project-docs', async (req, res) => {
    const { id } = req.query;
    try {
        const result = await getProjectTranslationDocs(id);
        res.send(result);
    } catch(err) {
        console.log(err);
        res.status(500).send(err);
    }
})

router.get('/metrics', async (req, res) => {
    const { projectId } = req.query;
    try {
        const updatedProject = await updateProjectMetrics({projectId});
        res.send(updatedProject);
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on getting metrics ");
    }
})

router.get('/project-analysis', async (req, res) => {
    const { id } = req.query;
    try {
        const result = await getProjectAnalysis(id);
        res.send(result);
    } catch(err) {
        console.log(err);
        res.status(500).send(err);
    }
})

router.get('/move-files', async (req, res) => {
    const { fileId } = req.query;
    try {
        const result = await moveMemoqFileToProject(fileId);
        res.send(result);
    } catch(err) {
        console.log(err);
        res.status(500).send(err);
    }

})

router.post('/target-files', async (req, res) => {
    const { stepId } = req.body;
    try {
        await downloadCompletedFiles(stepId);
        res.send("Files downloaded");
    } catch(err) {
        console.log(err);
        res.status(500).send(err);
    }
})

router.get('/download-file', async (req, res) => {
    const { projectId, docId } = req.query;
    try {
        const fileId = await getMemoqFileId(projectId, docId);
        const sessionId = await exportMemoqFile(fileId);
        const result = await getMemoqFileChunks(sessionId);
        res.send(result);
    } catch(err) {
        console.log(err);
        res.status(500).send(err);
    }
})

module.exports = router;
