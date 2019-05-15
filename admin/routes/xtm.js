const router = require('express').Router();
const { upload } = require('../utils/');
const { getRequestOptions, getTaskProgress, generateTargetFile } = require('../services/');
const { getProject, updateProject, updateProjectCosts, createTasks, calcCost, updateProjectProgress, updateStepsProgress, areAllStepsCompleted, updateTaskTargetFiles } = require('../projects/');
const { updateProjectMetrics } = require('../projects/metrics');
const fs = require('fs');
const unirest = require('unirest');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const parser = require('xml2json');
const https = require('https');
const { xtmToken, xtmBaseUrl } = require('../configs/');

router.post('/add-tasks', upload.fields([{name: 'sourceFiles'}, {name: 'refFiles'}]), async (req, res) => {
    try {
        let tasksInfo = {...req.body};
        tasksInfo.source = JSON.parse(tasksInfo.source);
        tasksInfo.targets = JSON.parse(tasksInfo.targets);
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
        const updatedProject = await updateProjectMetrics({projectId});
        res.send("ok");
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on getting metrics ");
    }
})

router.get('/update-progress', async (req, res) => {
    const { projectId } = req.query;
    try {
        const project = await getProject({"_id": projectId});
        const result = await updateProjectProgress(project);
        res.send(result);
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on getting metrics ");
    }
})

router.post('/request', upload.fields([{ name: 'sourceFiles' }, { name: 'refFiles' }]), async (req, res) => {
    res.send("ok");
})

router.get('/xtm-customers', async (req, res) => {
    try {
        unirest.get(`${xtmBaseUrl}/rest-api/customers`)
            .headers({"Authorization": xtmToken,
            'Content-Type': 'application/json'}) 
            .end((response) => {
                res.send(response.body);
            })
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

router.get('/xtmwords', async (req, res) => {
    let id = req.query.projectId;
    let str = '<?xml version="1.0" encoding="UTF-8"?>' +
    '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:pm="http://pm.v2.webservice.projectmanagergui.xmlintl.com/">' +
    '<soapenv:Header/>' +
    '<soapenv:Body>' +
      '<pm:obtainProjectMetrics>' +
         '<loginAPI>' +
            '<client>Pangea</client>' +
            '<password>pm</password>' +
            '<userId>3150</userId>' +
         '</loginAPI>' +
         '<project>' +
            `<id>${id}</id>` +
         '</project>' +
      '</pm:obtainProjectMetrics>' +
    '</soapenv:Body>' +
    '</soapenv:Envelope>';

    function createCORSRequest(method, url) {
        let xhr = new XMLHttpRequest();
        if ("withCredentials" in xhr) {
            xhr.open(method, url, false);
        } else if (typeof XDomainRequest != "undefined") {
            alert
            xhr = new XDomainRequest();
            xhr.open(method, url);
        } else {
            console.log("CORS not supported");
            alert("CORS not supported");
            xhr = null;
        }
        return xhr;
    }
    let xhr = createCORSRequest("POST", `${xtmBaseUrl}/project-manager-gui/services/v2/XTMProjectManagerMTOMWebService?wsdl`);
    if(!xhr){
    console.log("XHR issue");
    return;
    }

    xhr.onload = function (){
    let results = '<?xml version="1.0" encoding="UTF-8"?><projectMetrics>' + xhr.responseText.split('<projectMetrics>')[1].split('</projectMetrics>')[0] + '</projectMetrics>';
    let object = JSON.parse(parser.toJson(results));
    let wordsTotal = object.projectMetrics.coreMetrics.totalWords;
    res.send(wordsTotal);
    }

    xhr.setRequestHeader('Content-Type', 'text/xml');
    xhr.send(str);
})

router.get('/editor', async (req, res) => {
    try {
        let jobId = parseInt(req.query.jobId);
        const { stepName } = req.query;
        let str = '<?xml version="1.0" encoding="UTF-8"?>' +
        '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:pm="http://pm.v2.webservice.projectmanagergui.xmlintl.com/">' +
    '<soapenv:Header/>' +
    '<soapenv:Body>' +
        '<pm:obtainXTMEditorLink>' +
            '<loginAPI>' +
                '<client>Pangea</client>' +
                '<password>pm</password>' +
                '<userId>3150</userId>' +
            '</loginAPI>' +
            '<editor>' +
                '<customerDescriptor>' +
                '<id>26216</id>' +
                '</customerDescriptor>' +
                '<jobDescriptor>' +
                `<id>${jobId}</id>` +
                '</jobDescriptor>' +
                '<userDescriptor>' +
                '<id>3150</id>' +
                '</userDescriptor>' +
                '<userOptions>' +
                '<role>TRANSLATOR</role>' +
                '<terminologyRights>UPDATE_APPROVE</terminologyRights>' +
                '</userOptions>' +
                '<workflowOptions>' +
                '<currentWorkflowStep>' +
                `<workflowStepName>${stepName}</workflowStepName>` +
                '</currentWorkflowStep>' +
                '</workflowOptions>' + 
            '</editor>' +
            '<options/>' +
        '</pm:obtainXTMEditorLink>' +
        '</soapenv:Body>' +
        '</soapenv:Envelope>';

        function createCORSRequest(method, url) {
            let xhr = new XMLHttpRequest();
            if ("withCredentials" in xhr) {
                xhr.open(method, url, false);
            } else if (typeof XDomainRequest != "undefined") {
                alert
                xhr = new XDomainRequest();
                xhr.open(method, url);
            } else {
                console.log("CORS not supported");
                alert("CORS not supported");
                xhr = null;
            }
            return xhr;
        }
        let xhr = createCORSRequest("POST", `${xtmBaseUrl}/project-manager-gui/services/v2/XTMProjectManagerMTOMWebService?wsdl`);
        if(!xhr){
        console.log("XHR issue");
        return;
        }

        xhr.onload = function (){
        let results = '<?xml version="1.0" encoding="UTF-8"?><editorURL>' + xhr.responseText.split('<editorURL>')[1].split('</editorURL>')[0] + '</editorURL>';
        let object = JSON.parse(parser.toJson(results));
        let editorLink = object.editorURL;
        res.send(editorLink);
        }

        xhr.setRequestHeader('Content-Type', 'text/xml');
        xhr.send(str);
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on trying to get editor URL");
    }
})

router.post('/step-target', async (req, res) => {
    const { step, projectId } = req.body;
    try {
        const project = await getProject({"_id": projectId});
        let stepIndex = project.steps.findIndex(item => {
            return item.taskId === step.taskId && item.name === step.name
        });
        project.steps[stepIndex].targetFiles = step.targetFiles;
        const updatedProject = await updateProject({"_id": projectId}, {steps: project.steps});
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
    const options = getRequestOptions({
        method: "GET",
        path: `projects/${projectId}/files/${file.fileId}/download?fileType=TARGET`,
    });
    try {
        const fileName = file.fileName.split('.')[0];
        let wstream = fs.createWriteStream(`./dist/projectFiles/${id}/${step.name}-${fileName}.zip`);
        let reqq = https.request(options, (resp) => {
            resp.pipe(wstream);
        });
        reqq.end(); 
        wstream.on('finish', async () => {
            const updatedProject = await updateTaskTargetFiles({step, jobId: file.jobId, path: `/projectFiles/${id}/${step.name}-${fileName}.zip`});
            res.send({path: `/projectFiles/${id}/${step.name}-${fileName}.zip`, updatedProject});
        })
    } catch(err) {
        console.log(err);
        res.send(err);
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