const router = require('express').Router();
const { upload , moveFile } = require('../utils/');
const { Requests, Projects, Clients, Languages, Services, Industries } = require('../models');
const { saveTasks, saveTemplateTasks, getMetrics, createNewXtmCustomer, getRequestOptions } = require('../services/');
const { getProject, updateProject, updateProjectCosts, metricsCalc, storeFiles, calcCost, taskMetricsCalc } = require('../projects/');
const fs = require('fs');
const unirest = require('unirest');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const parser = require('xml2json');
const https = require('https');
const { xtmAuth } = require('../configs/');

router.post('/add-tasks', upload.fields([{name: 'sourceFiles'}, {name: 'refFiles'}]), async (req, res) => {
    let tasksInfo = {...req.body};
    tasksInfo.source = JSON.parse(tasksInfo.source);
    tasksInfo.targets = JSON.parse(tasksInfo.targets);
    const { sourceFiles, refFiles } = req.files;
    let template = tasksInfo.template || '247336FD';
    let workflow = tasksInfo.workflow || 2917;
    try {
        let customerId = tasksInfo.customerId || await createNewXtmCustomer(tasksInfo.customerName);
        const filesToTranslate = await storeFiles(sourceFiles, tasksInfo.projectId);
        const referenceFiles = await storeFiles(refFiles, tasksInfo.projectId);
        let translationFiles = {};
        for(let index in filesToTranslate) {
            translationFiles[`translationFiles[${index}].file`] = filesToTranslate[index];
        }
        const project = await Projects.findOne({"_id": tasksInfo.projectId});
        let tasksLength = project.tasks.length + 1;
        for(let target of tasksInfo.targets) {
            let name = `${project.projectId} - ${project.projectName} (${target.xtm.toUpperCase()})`
            let xtmProject = await saveTemplateTasks({
                customerId: customerId,
                name: name,
                source: tasksInfo.source.xtm,
                target: target.xtm,
                translationFiles: translationFiles,
                templateId: template,
                workflowId: workflow
            });
            for(let job of xtmProject.jobs) {
                let idNumber = tasksLength < 10 ? `T0${tasksLength}` : `T${tasksLength}`; 
                let taskId = project.projectId + ` ${idNumber}`;
                await Projects.updateOne({"_id": project._id}, 
                {$set: {xtmId: xtmProject.projectId, sourceFiles: filesToTranslate, refFiles: referenceFiles}, 
                $push: {tasks: {taskId: taskId, id: job.jobId, service: tasksInfo.service, projectId: xtmProject.projectId, start: new Date(), 
                    deadline: project.deadline, sourceLanguage: tasksInfo.source.symbol, targetLanguage: target.symbol, status: "Created", cost: "",
                    receivables: "", payables: "", check: false, finance: {'Wordcount': {receivables: "", payables: ""}, 'Price': {receivables: "", payables: ""}}}}}
                );
                tasksLength++
            }
        }
        const updatedProject = await getProject({"_id": tasksInfo.projectId});
        res.send(updatedProject);
    } catch(err) {
        console.log(err);
        res.status(500).send('Error on adding project to XTM');
    }
})

router.post('/update-matrix', async (req, res) => {
    const { projectId, taskId, step, key, value, prop } = req.body;
    const { rate, costName } = prop === 'client' ? { rate: step.clientRate, costName: 'receivables' } 
    : {rate: step.vendroRate, costName: 'payables'};
    try {
        let project = await getProject({"_id": projectId});
        let taskIndex = project.tasks.findIndex(item => {
            return item.id === taskId
        });
        let stepIndex = project.steps.findIndex(item => {
            return item.name === step.name && item.taskId === step.taskId
        })
        let tasks = [...project.tasks];
        let steps = [...project.steps];
        tasks[taskIndex].metrics[key][prop] = +value/100;
        const cost = calcCost(tasks[taskIndex].metrics, prop, rate);
        steps[stepIndex][costName] = cost;
        let updatedProject = {...project._doc, id: projectId, tasks, steps};
        const result = await updateProjectCosts(updatedProject);
        res.send(result);
    } catch(err) {
        console.log(err);
        res.status(500).send('Error on updating value of matrix');
    }
})

router.get('/project-metrics', async (req, res) => {
    const { projectId, customerId } = req.query;
    try {
        unirest.get(`http://wstest2.xtm-intl.com/rest-api/projects/${projectId}/metrics`)
        .headers({"Authorization": "XTM-Basic lGoRADtSF14/TQomvOJnHrIFg5QhHDPwrjlgrQJOLtnaYpordXXn98IwnSjt+7fQJ1FpjAQz410K6aGzYssKtQ==",
        'Content-Type': 'application/json'})
        .end(async (response) => {
            if(response.error) {
                throw new Error(response.error);
            }
            try {
                const metrics = response.body[0].jobsMetrics[0];
                const { xtmMetrics, progress } = await metricsCalc(metrics);
                const customer = await Clients.findOne({"_id": customerId});    
                const taskMetrics = taskMetricsCalc({metrics: xtmMetrics, matrix: customer.matrix, prop: 'client'});
                res.send({taskMetrics, progress});
            } catch(err) {
                console.log(err);
                res.status(500).send("Error on getting metrics ");
            }
        })
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on getting metrics ");
    }
})

router.post('/request', upload.fields([{ name: 'sourceFiles' }, { name: 'refFiles' }]), async (req, res) => {
    let project = new Projects(req.body);
    let todayStart = new Date();
    todayStart.setUTCHours(0,0,0,0);
    let todayEnd = new Date(todayStart);
    todayEnd.setUTCHours(23,59,59,0);
    let todaysProjects = await Projects.find({"createdAt" : { $gte : todayStart, $lt: todayEnd }});
    let nextNumber = (todaysProjects.length < 10) ? '[0' + (todaysProjects.length + 1) + ']': '[' + (todaysProjects.length + 1) + ']';
    project.status = "Open";
    project.projectId = req.body.dateFormatted + ' ' + nextNumber;
    let date = req.body.dateFormatted;
    let xtmData = req.body;
    let sourceLanguage = JSON.parse(xtmData.sourceLanguage);
    let targetLanguages = JSON.parse(xtmData.targetLanguages);
    project.sourceLanguage = sourceLanguage;
    project.targetLanguages = targetLanguages;
    let templateId;
    let workflowId;
    if(xtmData.template) {
        templateId = xtmData.template;
    }
    if(xtmData.workflow) {
        workflowId = xtmData.workflow;
    }
    let symbol = sourceLanguage.symbol.split('-');
    let source = symbol[0].toLowerCase() + '_' + symbol[1];
    let target = [];

    const { sourceFiles, refFiles } = req.files;
    let detFile = "";
    if (sourceFiles) {
        detFile = sourceFiles[0].path;
    }

    for(let i  = 0; i < targetLanguages.length; i++) {
        target.push(targetLanguages[i].xtm);
    }
    let ids = [];
    for(let i = 0; i < target.length; i++) {
        let name = date + ` ${nextNumber} ` + '- ' + xtmData.projectName + ' (' + target[i].toUpperCase() + ') ';
        let proj;
        if(xtmData.customerId) {
            proj = await saveTemplateTasks({
                customerId: xtmData.customerId,
                name: name,
                source: source,
                target: target[i],
                file: detFile,
                templateId: templateId,
                workflowId: workflowId
            });
        } else {
            proj = await saveTasks({
                customerId: 23,
                name: name,
                source: source,
                target: target[i],
                file: detFile
            });
        }
        project.xtmId = proj.body.projectId;
        ids.push(proj.body.jobs[0].jobId);
        project.jobs.push({id: proj.body.jobs[0].jobId, sourceLanguage: sourceLanguage.lang, targetLanguage: targetLanguages[i].lang, status: "In Progress", wordcount: "", cost: ""});
        if(target.length - i == 1) {
            await project.save();
            let finalArray = await ids;
            res.send(finalArray);
            setTimeout(() => {
                fs.unlink(detFile, (err) => {
                    if(err) {
                        console.log(err)
                    }
                });
            },2000);
        }    
    }
})

router.get('/xtm-customers', async (req, res) => {
    unirest.get('http://wstest2.xtm-intl.com/rest-api/customers')
        .headers({"Authorization": "XTM-Basic lGoRADtSF14/TQomvOJnHrIFg5QhHDPwrjlgrQJOLtnaYpordXXn98IwnSjt+7fQJ1FpjAQz410K6aGzYssKtQ==",
        'Content-Type': 'application/json'}) 
        .end((response) => {
            res.send(response.body);
        })
})

router.get('/xtm-clientinfo', async (req, res) => {
    unirest.get(`http://wstest2.xtm-intl.com/rest-api/customers?fetchAddress=YES&ids=${req.query.id}`)
        .headers({"Authorization": "XTM-Basic lGoRADtSF14/TQomvOJnHrIFg5QhHDPwrjlgrQJOLtnaYpordXXn98IwnSjt+7fQJ1FpjAQz410K6aGzYssKtQ==",
        'Content-Type': 'application/json'}) 
        .end((response) => {
            res.send(response.body);
        })
})

router.post('/saveproject', async (req, res) => {
    const project = { ...req.body };
    try {
        const savedProject = await Projects.updateOne({"_id": project._id}, project);
        res.send('Project saved!');
    } catch(err) {
        console.log(err);
        res.status(500).send('Something wrong with project saving... ' + err);
    }
})

router.post('/update-project', async (req, res) => {
    const project = { ...req.body };
    try {
        const savedProject = await Projects.updateOne({"_id": project.id}, {$set: {steps: project.steps, tasks: project.tasks, isMetricsExist: project.isMetricsExist}});
        res.send('Project updated!');
    } catch(err) {
        console.log(err);
        res.status(500).send('Something wrong with project saving... ' + err);
    }
})

router.post('/savejobs', async (req, res) => {
    const jobs = req.body.jobs;
    const projectId = req.body.id;
    try {
        await Projects.updateOne({"_id": projectId}, {$set: {"jobs": jobs, metrics: true}});
        res.send("Jobs saved")
    }
    catch(err) {
        console.log(err)
        res.status(500).send('Error on Jobs saving ' + err)
    }
})

router.get('/newproject', async (req, res) => {
    unirest.post('http://wstest2.xtm-intl.com/rest-api/projects')
        .headers({"Authorization": "XTM-Basic lGoRADtSF14/TQomvOJnHrIFg5QhHDPwrjlgrQJOLtnaYpordXXn98IwnSjt+7fQJ1FpjAQz410K6aGzYssKtQ==",
        'Content-Type': 'multipart/form-data'}) 
        .field('customerId', 23)
        .field('name',  'Project-Test')
        .field('sourceLanguage', 'pl_PL')
        .field('targetLanguages', 'en_GB')
        .field('workflowId', 2890)
        .end( (response) => {
            res.send('Done')
        })
})

router.get('/metrics', async (req, res) => {
    const projectId = parseInt(req.query.projectId);
    try {
        const result = await getMetrics(projectId);
        res.send(result)
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on getting metrics " + err)
    }
})

router.get('/status', async (req, res) => {
    unirest.get('http://wstest2.xtm-intl.com/rest-api/projects/5500/status?fetchLevel=STEPS')
        .headers({"Authorization": "XTM-Basic lGoRADtSF14/TQomvOJnHrIFg5QhHDPwrjlgrQJOLtnaYpordXXn98IwnSjt+7fQJ1FpjAQz410K6aGzYssKtQ==",
        'Content-Type': 'application/json'})
        .end( (response) => {
        res.send(response.body)
        })
})

router.get('/estimates', async (req, res) => {
    unirest.get('http://wstest2.xtm-intl.com/rest-api/projects/5500/proposal')
        .headers({"Authorization": "XTM-Basic lGoRADtSF14/TQomvOJnHrIFg5QhHDPwrjlgrQJOLtnaYpordXXn98IwnSjt+7fQJ1FpjAQz410K6aGzYssKtQ==",
        'Content-Type': 'application/json'})
        .end( (response) => {
        res.send(response.body)
        })
})

router.get('/jobs-metrics', async (req, res) => {
    unirest.get(`http://wstest2.xtm-intl.com/rest-api/projects/${req.query.projectId}/metrics/jobs?jobIds=${req.query.jobId}`)
        .headers({"Authorization": "XTM-Basic lGoRADtSF14/TQomvOJnHrIFg5QhHDPwrjlgrQJOLtnaYpordXXn98IwnSjt+7fQJ1FpjAQz410K6aGzYssKtQ==",
        'Content-Type': 'application/json'})
        .end( (response) => {
        res.send(response.body)
        })
})

router.get('/customer-projects', async (req, res) => {
    unirest.get('http://wstest2.xtm-intl.com/rest-api/projects?customerIds=5041&Ids=5500')
        .headers({"Authorization": "XTM-Basic lGoRADtSF14/TQomvOJnHrIFg5QhHDPwrjlgrQJOLtnaYpordXXn98IwnSjt+7fQJ1FpjAQz410K6aGzYssKtQ==",
        'Content-Type': 'application/json'})
        .end( (response) => {
        res.send(response.body)
        })
})

router.get('/projects-analysis', async (req, res) => {
    unirest.get('http://wstest2.xtm-intl.com/rest-api/projects/5500/analysis?fetchLevel=JOBS')
        .headers({"Authorization": "XTM-Basic lGoRADtSF14/TQomvOJnHrIFg5QhHDPwrjlgrQJOLtnaYpordXXn98IwnSjt+7fQJ1FpjAQz410K6aGzYssKtQ==",
        'Content-Type': 'application/json'})
        .end( (response) => {
        res.send(response.body)
        })
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
    let xhr = createCORSRequest("POST", "http://wstest2.xtm-intl.com/project-manager-gui/services/v2/XTMProjectManagerMTOMWebService?wsdl");
    if(!xhr){
    console.log("XHR issue");
    return;
    }

    xhr.onload = function (){
    // let results = '<?xml version="1.0" encoding="UTF-8"?><soap:Envelope' + xhr.responseText.split('<soap:Envelope')[1].split('--uuid')[0];
    let results = '<?xml version="1.0" encoding="UTF-8"?><projectMetrics>' + xhr.responseText.split('<projectMetrics>')[1].split('</projectMetrics>')[0] + '</projectMetrics>';
    // console.log(parser.toJson(results));
    let object = JSON.parse(parser.toJson(results));
    let wordsTotal = object.projectMetrics.coreMetrics.totalWords;
    res.send(wordsTotal);
    }

    xhr.setRequestHeader('Content-Type', 'text/xml');
    xhr.send(str);
})

router.get('/editor', async (req, res) => {
    let jobId = parseInt(req.query.jobId);
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
               '<id>23</id>' +
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
                  '<id>2885</id>' +
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
    let xhr = createCORSRequest("POST", "http://wstest2.xtm-intl.com/project-manager-gui/services/v2/XTMProjectManagerMTOMWebService?wsdl");
    if(!xhr){
    console.log("XHR issue");
    return;
    }

    xhr.onload = function (){
    let results = '<?xml version="1.0" encoding="UTF-8"?><editorURL>' + xhr.responseText.split('<editorURL>')[1].split('</editorURL>')[0] + '</editorURL>';
    // console.log(parser.toJson(results));
    let object = JSON.parse(parser.toJson(results));
    let editorLink = object.editorURL;
    res.send(editorLink);
    }

    xhr.setRequestHeader('Content-Type', 'text/xml');
    xhr.send(str);
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
    const { projectId, taskId } = req.body;
    try {
        unirest.post(`http://wstest2.xtm-intl.com/rest-api/projects/${projectId}/files/generate?jobIds=${taskId}&fileType=TARGET`)
            .headers({"Authorization": xtmAuth.token})
            .end( (response) => {
                if(response.error) {
                    throw new Error('Error on generating file in XTM');
                }
                res.send(response.body);
            }) 
    } catch(err) {
        console.log(err);
        res.status(400).send('Error / Cannot generate file in XTM');
    }
})

router.get('/target-file', async (req, res) => {
    const { id, projectId, fileId } = req.query;
    const requestData = {
        method: "GET",
        path: `projects/${projectId}/files/${fileId}/download?fileType=TARGET`,
    }
    const options = getRequestOptions(requestData);
    try {
        let wstream = fs.createWriteStream(`./dist/projectFiles/${id}/target-${fileId}.zip`);
        let reqq = await https.request(options, (resp) => {
            resp.pipe(wstream);
        });
        reqq.end(); 
        wstream.on('finish', () => {
        res.send({path: `/projectFiles/${id}/target-${fileId}.zip`});
        })
    } catch(err) {
        console.log(err);
        res.send(err);
    }
})

module.exports = router;