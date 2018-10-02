const router = require('express').Router();
const upload = require('../utils/uploads');
const moveFile = require('../utils/moveFile');
const { Requests, Projects, Languages, Services, Industries } = require('../models');
const { saveJobs, saveTemplateJobs, getMetrics } = require('../services/xtmApi');
const fs = require('fs');
const unirest = require('unirest');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const parser = require('xml2json');

router.post('/add-tasks', upload.fields([{name: 'sourceFiles'}, {name: 'refFiles'}]), async (req, res) => {
    let tasksInfo = {...req.body};
    tasksInfo.source = JSON.parse(tasksInfo.source);
    tasksInfo.targets = JSON.parse(tasksInfo.targets);
    const sourceFiles = req.files["sourceFiles"];
    const refFiles = req.files["refFiles"];
    const translationFile = sourceFiles ? moveFile(sourceFiles[0], `./dist/reqfiles/${tasksInfo.projectId}/source-${sourceFiles[0].filename}`) : "";
    let template = tasksInfo.template ? tasksInfo.template : '247336FD';
    let workflow = tasksInfo.workflow ? tasksInfo.workflow : 2890;
    let customerId = tasksInfo.customerId ? +tasksInfo.customerId : 23;
    try {
        const project = await Projects.findOne({"_id": tasksInfo.projectId});
        for(let target of tasksInfo.targets) {
            let name = `${project.projectId} - ${project.projectName} (${target.xtm.toUpperCase()})`
            let xtmProject = await saveTemplateJobs({
                customerId: customerId,
                name: name,
                source: tasksInfo.source.xtm,
                target: target.xtm,
                file: translationFile,
                templateId: template,
                workflowId: workflow
            });
            await Projects.updateOne({"_id": project._id}, 
            {$set: {xtmId: xtmProject.projectId, detailFiles: [translationFile]}, 
            $push: {jobs: {id: xtmProject.jobs[0].jobId, projectId: xtmProject.projectId, sourceLanguage: tasksInfo.source.symbol, targetLanguage: target.symbol, status: "In Progress", cost: ""}}}
            );
        }
        const updatedProject = await Projects.findOne({"_id": tasksInfo.projectId});
        res.send(updatedProject);
    } catch(err) {
        console.log(err);
        res.status(500).send('Error on adding project to XTM ' + err);
    }
})

router.get('/project-metrics', async (req, res) => {
    let project = await Projects.findOne({"_id": req.query.projectId});
    let updatedProject = {};
    try {
        for(let i = 0; i < project.jobs.length; i++) {
            const id = project.jobs[i].projectId;
            unirest.get(`http://wstest2.xtm-intl.com/rest-api/projects/${id}/metrics`)
            .headers({"Authorization": "XTM-Basic lGoRADtSF14/TQomvOJnHrIFg5QhHDPwrjlgrQJOLtnaYpordXXn98IwnSjt+7fQJ1FpjAQz410K6aGzYssKtQ==",
            'Content-Type': 'application/json'})
            .end(async (response) => {
                const metrics = response.body[0].jobsMetrics[0];
                const jobMetrics = {
                    iceMatch: metrics.coreMetrics.iceMatchWords,
                    fuzzyMatch75: metrics.coreMetrics.lowFuzzyMatchWords,
                    fuzzyMatch85: metrics.coreMetrics.mediumFuzzyMatchWords,
                    fuzzyMatch95: metrics.coreMetrics.highFuzzyMatchWords,
                    repeat: metrics.coreMetrics.repeatsWords,
                    leveragedMatch: metrics.coreMetrics.leveragedWords,
                    fuzzyRepeats75: metrics.coreMetrics.lowFuzzyRepeatsWords,
                    fuzzyRepeats85: metrics.coreMetrics.mediumFuzzyRepeatsWords,
                    fuzzyRepeats95: metrics.coreMetrics.highFuzzyRepeatsWords,
                    nonTranslatable: metrics.coreMetrics.nonTranslatableWords,
                    totalWords: metrics.coreMetrics.totalWords,
                }     
                const progress = {};
                for(const key in metrics.metricsProgress) {
                    progress[key] = {
                        wordsToBeDone: metrics.metricsProgress[key].wordsToBeDone,
                        wordsDone: metrics.metricsProgress[key].wordsDone,
                        wordsToBeChecked: metrics.metricsProgress[key].wordsToBeChecked,
                        wordsToBeCorrected: metrics.metricsProgress[key].wordsToBeCorrected,
                    }
                }
                project.jobs[i].metrics = jobMetrics;
                project.jobs[i].progress = progress;
                project.jobs[i].wordcount = jobMetrics.totalWords;
                await Projects.updateOne({"_id": req.query.projectId}, {$set: {jobs: project.jobs}});
            })
            updatedProject = await Projects.findOne({"_id": req.query.projectId});
        }
        res.send(updatedProject);
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on getting metrics " + err)
    }
})

router.post('/request', upload.fields([{ name: 'detailFiles' }, { name: 'refFiles' }]), async (req, res) => {
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

    const detailFiles = req.files["detailFiles"];
    const refFiles = req.files["refFiles"];
    if (detailFiles) {
        var detFile = detailFiles[0].path;
    }

    for(let i  = 0; i < targetLanguages.length; i++) {
        target.push(targetLanguages[i].xtm);
    }
    var ids = [];
    for(let i = 0; i < target.length; i++) {
        let name = date + ` ${nextNumber} ` + '- ' + xtmData.projectName + ' (' + target[i].toUpperCase() + ') ';
        let proj;
        if(xtmData.customerId) {
            proj = await saveTemplateJobs({
                customerId: xtmData.customerId,
                name: name,
                source: source,
                target: target[i],
                file: detFile,
                templateId: templateId,
                workflowId: workflowId
            });
        } else {
            proj = await saveJobs({
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
    let project = req.body;
    let projectId = req.body.projectId;
    Projects.update({"_id": project._id}, project)
    .then(result => {
        res.send(result)
    })
    .catch(err => {
        console.log(err)
        res.send('Something wrong...')
    })
})

router.post('/savejobs', async (req, res) => {
    let jobs = req.body.jobs;
    let projectId = req.body.id;
    let metrics = req.body.metrics;
    Projects.update({"_id": projectId}, {$set: {"jobs": jobs, "metrics": metrics}})
    .then(result => {
        res.send(result)
    })
    .catch(err => {
        console.log(err)
        res.send('Something wrong...')
    })
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
    unirest.get('http://wstest2.xtm-intl.com/rest-api/projects/14655/metrics/jobs?jobIds=14661')
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

router.get('/newcustomer', async (req, res) => {
    var customerName = req.query.name;
    var str = '<?xml version="1.0" encoding="UTF-8"?>' +
        '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:pm="http://pm.v2.webservice.projectmanagergui.xmlintl.com/">' +
    '<soapenv:Header/>' +
    '<soapenv:Body>' +
      '<pm:createCustomer>'+
         '<loginAPI>'+
            '<client>Pangea</client>' +
            '<password>pm</password>' +
            '<userId>3150</userId>' +
         '</loginAPI>' +
         '<customer>' + 
            '<customerBase>' +
               `<name>${customerName}</name>` +
            '</customerBase>' +
         '</customer>' +
         '<options/>' +
      '</pm:createCustomer>' +
    '</soapenv:Body>' +
    '</soapenv:Envelope>';
    function createCORSRequest(method, url) {
        var xhr = new XMLHttpRequest();
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
    var xhr = createCORSRequest("POST", "http://wstest2.xtm-intl.com/project-manager-gui/services/v2/XTMProjectManagerMTOMWebService?wsdl");
    if(!xhr){
    console.log("XHR issue");
    return;
    }

    xhr.onload = function (){
    var results = xhr.responseText;
    var id;
    if(results.indexOf('<id>') != -1) {
        results = results.split('<id>')[1];
        id = results.split("</id>")[0];
    }
    res.send(id);
    }

    xhr.setRequestHeader('Content-Type', 'text/xml');
    xhr.send(str);
})

router.get('/xtmwords', async (req, res) => {
    var id = req.query.projectId;
    var str = '<?xml version="1.0" encoding="UTF-8"?>' +
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
        var xhr = new XMLHttpRequest();
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
    var xhr = createCORSRequest("POST", "http://wstest2.xtm-intl.com/project-manager-gui/services/v2/XTMProjectManagerMTOMWebService?wsdl");
    if(!xhr){
    console.log("XHR issue");
    return;
    }

    xhr.onload = function (){
    // var results = '<?xml version="1.0" encoding="UTF-8"?><soap:Envelope' + xhr.responseText.split('<soap:Envelope')[1].split('--uuid')[0];
    var results = '<?xml version="1.0" encoding="UTF-8"?><projectMetrics>' + xhr.responseText.split('<projectMetrics>')[1].split('</projectMetrics>')[0] + '</projectMetrics>';
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
        var xhr = new XMLHttpRequest();
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
    var xhr = createCORSRequest("POST", "http://wstest2.xtm-intl.com/project-manager-gui/services/v2/XTMProjectManagerMTOMWebService?wsdl");
    if(!xhr){
    console.log("XHR issue");
    return;
    }

    xhr.onload = function (){
    var results = '<?xml version="1.0" encoding="UTF-8"?><editorURL>' + xhr.responseText.split('<editorURL>')[1].split('</editorURL>')[0] + '</editorURL>';
    // console.log(parser.toJson(results));
    let object = JSON.parse(parser.toJson(results));
    let editorLink = object.editorURL;
    res.send(editorLink);
    }

    xhr.setRequestHeader('Content-Type', 'text/xml');
    xhr.send(str);
})

module.exports = router;