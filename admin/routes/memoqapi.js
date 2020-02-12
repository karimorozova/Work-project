const router = require('express').Router();
const { upload } = require('../utils');
const { getMemoqAllProjects, createMemoqProject, createMemoqProjectWithTemplate, getProjectTranslationDocs, getProjectUsers } = require("../services/memoqs/projects");
const { uploadFileToMemoq, moveMemoqFileToProject, addFilesToMemoq, addAllFiles } = require("../services/memoqs/files");
const { getMemoqTemplates} = require("../services/memoqs/resources");
const { createMemoqTasks } = require("../projects/create");
const { storeFiles } = require("../projects/files");
const { getMemoqUsers } = require("../services/memoqs/users");

router.get('/users', async (req, res) => {
    try {
        const result = await getMemoqUsers();
        res.json(result);
    } catch(err) {
        console.log(err);
        res.status(500).send(err);
    }
})

router.get('/templates', async (req, res) => {
    try {
        const result = await getMemoqTemplates();
        res.json(result);
    } catch(err) {
        console.log(err);
        res.status(500).send(err);
    }
})

router.post('/tasks', upload.fields([{name: 'sourceFiles'}, {name: 'refFiles'}]), async (req, res) => {
    try {
        let tasksInfo = {...req.body};
        if(tasksInfo.source) {
            tasksInfo.source = JSON.parse(tasksInfo.source);
        }
        tasksInfo.targets = JSON.parse(tasksInfo.targets);
        tasksInfo.service = JSON.parse(tasksInfo.service);
        const { sourceFiles, refFiles } = req.files;
        const translateFiles = await storeFiles(sourceFiles, tasksInfo.projectId);
        const memoqProjectId = await createMemoqProjectWithTemplate(tasksInfo);
        await addAllFiles(memoqProjectId, translateFiles);
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

router.post('/all-files', async (req, res) => {
    const { name } = req.body;
    try {
        await addAllFiles(name);
        res.send("done");
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

module.exports = router;
