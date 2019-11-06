const router = require('express').Router();
const { upload } = require('../utils/');
const { getRequestOptions, generateTargetFile, getXtmCustomers, getEditorUrl } = require('../services/');
const { getProject, updateProject, createTasks, updateProjectProgress, storeTargetFile, updateTaskTargetFiles, updateNonWordsTaskTargetFiles, storeFiles} = require('../projects/');
const { calcCost, updateProjectCosts } = require('../сalculations/wordcount');
const { updateProjectMetrics } = require('../projects/metrics');
const fs = require('fs');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const parser = require('xml2json');
const https = require('https');
const { xtmBaseUrl } = require('../configs/');

router.post('/add-tasks', upload.fields([{name: 'sourceFiles'}, {name: 'refFiles'}]), async (req, res) => {
    try {
        let tasksInfo = {...req.body};
        if(tasksInfo.source) {
            tasksInfo.source = JSON.parse(tasksInfo.source);
        }
        tasksInfo.targets = JSON.parse(tasksInfo.targets);
        tasksInfo.service = JSON.parse(tasksInfo.service);
        const { sourceFiles, refFiles } = req.files;
        const updatedProject = await createTasks({tasksInfo, sourceFiles, refFiles});
        res.send(updatedProject);
    } catch(err) {
        console.log(err);
        res.status(500).send('Error on adding project to XTM');
    }
})

router.post('/update-matrix', async (req, res) => {
    const { projectId, taskId, step, key, value, prop } = req.body;
    const { rate, costName } = prop === 'client' ? { rate: step.clientRate, costName: 'receivables' } 
    : {rate: step.vendorRate, costName: 'payables'};
    try {
        let project = await getProject({"_id": projectId});
        let taskIndex = project.tasks.findIndex(item => {
            return item.taskId === taskId
        });
        let stepIndex = project.steps.findIndex(item => {
            return item.name === step.name && item.taskId === step.taskId
        })
        let tasks = [...project.tasks];
        let steps = [...project.steps];
        tasks[taskIndex].metrics[key][prop] = +value/100;
        const cost = calcCost(tasks[taskIndex].metrics, prop, rate);
        steps[stepIndex].finance.Price[costName] = cost;
        tasks[taskIndex].finance.Price[costName] = steps.filter(item => item.taskId === taskId).reduce((init, cur) => {
            return init + +cur.finance.Price[costName];
        }, 0)
        let updatedProject = {...project._doc, id: projectId, tasks, steps};
        const result = await updateProjectCosts(updatedProject);
        res.send(result);
    } catch(err) {
        console.log(err);
        res.status(500).send('Error on updating value of matrix');
    }
})

router.get('/metrics', async (req, res) => {
    const { projectId } = req.query;
    try {
        const isMetrics = await updateProjectMetrics({projectId});
        const status = isMetrics ? 'received' : 'invalid';
        res.send({status});
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on getting metrics ");
    }
})

router.post('/update-progress', async (req, res) => {
    const { projectId, isCatTool } = req.body;
    try {
        const project = await getProject({"_id": projectId});
        const result = await updateProjectProgress(project, isCatTool);
        res.send(result);
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on getting metrics ");
    }
})

router.get('/xtm-customers', async (req, res) => {
    try {
        const xtmCustomers = await getXtmCustomers();
        res.send(xtmCustomers);
    } catch(err) {
        console.log(err);
        console.log("Error on getting customers from XTM");
    }
})

router.post('/update-project', async (req, res) => {
    const project = { ...req.body };
    try {
        const savedProject = await updateProject({"_id": project.id}, {steps: project.steps, tasks: project.tasks, isMetricsExist: project.isMetricsExist});
        res.send(savedProject);
    } catch(err) {
        console.log(err);
        res.status(500).send('Error on updating project');
    }
})

router.post('/editor', async (req, res) => {
    try {
        const { jobId, stepName, xtmProjectId } = req.body;
        const { url } = await getEditorUrl({jobId, stepName, xtmProjectId});
    res.send(url);
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on trying to get editor URL");
    }
})

router.post('/step-target', upload.fields([{name: 'targetFile'}]), async (req, res) => {
    const { jobId } = req.body;
    try {
        const project = await getProject({"steps._id": jobId});
        const { targetFile } = req.files;
        const paths = await storeFiles(targetFile, project.id);
        const updatedProject = await updateNonWordsTaskTargetFiles({project, path: paths[0], jobId, fileName: targetFile[0].filename});
        res.send(updatedProject);
    } catch(err) {
        console.log(err);
        res.status(500).send("Error / Cannot add Target file to the Steps array of Project")
    }
})

router.post('/generate-file', async (req, res) => {
    const { projectId, jobId } = req.body;
    try {
        const generatedFiles = await generateTargetFile({projectId, jobId});
        res.send(generatedFiles);
    } catch(err) {
        console.log(err);
        res.status(500).send('Error / Cannot generate file in XTM');
    }
})

router.post('/target-file', async (req, res) => {
    const { step, id, projectId, file } = req.body;
    try {
        const { path } = await storeTargetFile({ step, id, projectId, file });
        const updatedProject = await updateTaskTargetFiles({step, jobId: file.jobId, path});
        res.send({path, updatedProject});
    } catch(err) {
        console.log(err);
        res.status(500).send('Error / Cannot store target file');
    }
})

router.get('/delivery-file', async (req, res) => {
    const { fileId, projectId, id, taskId } = req.query;
    const options = getRequestOptions({
        method: "GET",
        path: `projects/${projectId}/files/${fileId}/download?fileType=TARGET`,
    })
    try {
        let wstream = fs.createWriteStream(`./dist/projectFiles/${id}/delivery-${taskId}.zip`);
        let reqq = https.request(options, (resp) => {
            resp.pipe(wstream);
        });
        reqq.end(); 
        wstream.on('finish', () => {
            res.send({path: `/projectFiles/${id}/delivery-${taskId}.zip`});
        })
    } catch(err) {

    }
})

module.exports = router;