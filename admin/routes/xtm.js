const router = require('express').Router();
const multer = require('multer');
const { Requests, Projects, Languages, Services, Industries } = require('../models');
const { saveJobs, saveTemplateJobs } = require('../models/xtmApi');
const fs = require('fs');
const mv = require('mv');
const unirest = require('unirest');
const https = require('https');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const parser = require('xml2json');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './dist/reqfiles/xtm')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  });
  
  var upload = multer({
    storage: storage
  });

function moveFile(oldFile, requestId) {

    var newFile = './dist/reqfiles/' + requestId + '/' + oldFile.filename;
    mv(oldFile.path, newFile, {
        mkdirp: true
    }, function (err) {
});
    return newFile;
}

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
    let projectId = parseInt(req.query.projectId);
    unirest.get(`http://wstest2.xtm-intl.com/rest-api/projects/${projectId}/metrics`)
        .headers({"Authorization": "XTM-Basic lGoRADtSF14/TQomvOJnHrIFg5QhHDPwrjlgrQJOLtnaYpordXXn98IwnSjt+7fQJ1FpjAQz410K6aGzYssKtQ==",
        'Content-Type': 'application/json'})
        .end( (response) => {
        res.send(response.body)
        })
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
    unirest.get('http://wstest2.xtm-intl.com/rest-api/projects/13288/metrics/jobs?jobIds=13294')
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