const router = require('express').Router();
const multer = require('multer');
const { Requests, Languages, Services, Industries } = require('../models');
const fs = require('fs');
const mv = require('mv');
const unirest = require('unirest');
const https = require('https');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const parser = require('xml2json');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './dist/reqfiles/11111')
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
    let xtmData = req.body;
    let date = xtmData.createdAt
    let sourcelang = JSON.parse(xtmData.sourceLanguage);
    let targetLanguages = JSON.parse(xtmData.targetLanguages);
    let symbol = sourcelang.symbol.split('-');
    let source = symbol[0].toLowerCase() + '_' + symbol[1];
    let target = [];

    const detailFiles = await req.files["detailFiles"];
    const refFiles = await req.files["refFiles"];
    if (detailFiles) {
        var detFile = detailFiles[0].path;
    }

    for(let i  = 0; i < targetLanguages.length; i++) {
        symbol = targetLanguages[i].symbol.split('-');
        target.push(symbol[0].toLowerCase() + '_' + symbol[1]);
    }
    var ids = [];
    for(let i = 0; i < target.length; i++) {
        let name = await date + ' [0' + (i + 1) +'] ' + '- ' + xtmData.projectName + ' (' + target[i].toUpperCase() + ') ';
    unirest.post('http://wstest2.xtm-intl.com/rest-api/projects')
        .headers({"Authorization": "XTM-Basic lGoRADtSF14/TQomvOJnHrIFg5QhHDPwrjlgrQJOLtnaYpordXXn98IwnSjt+7fQJ1FpjAQz410K6aGzYssKtQ==",
        'Content-Type': 'multipart/form-data'}) 
        .field('customerId', 23)
        .field('name',  name)
        .field('sourceLanguage', source)
        .field('targetLanguages', target[i])
        .field('workflowId', 2890)
        .attach('translationFiles[0].file', detFile)
        .end( (response) => {
            console.log(response.body);
            ids.push(response.body.projectId);
            if(target.length - i == 1) {
                res.send(ids);
                setTimeout(() => {
                    fs.unlink(detFile, (err) => console.log(err));
                },2000);
            }
        })   
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
            console.log(response.body);
        res.send('Done')
        })
})

router.get('/metrics', async (req, res) => {
    unirest.get('http://wstest2.xtm-intl.com/rest-api/projects/5500/metrics')
        .headers({"Authorization": "XTM-Basic lGoRADtSF14/TQomvOJnHrIFg5QhHDPwrjlgrQJOLtnaYpordXXn98IwnSjt+7fQJ1FpjAQz410K6aGzYssKtQ==",
        'Content-Type': 'application/json'})
        .end( (response) => {
            console.log(response.body);
        res.send(response.body)
        })
})

router.get('/customer-projects', async (req, res) => {
    unirest.get('http://wstest2.xtm-intl.com/rest-api/projects?customerIds=23')
        .headers({"Authorization": "XTM-Basic lGoRADtSF14/TQomvOJnHrIFg5QhHDPwrjlgrQJOLtnaYpordXXn98IwnSjt+7fQJ1FpjAQz410K6aGzYssKtQ==",
        'Content-Type': 'application/json'})
        .end( (response) => {
            console.log(response.body);
        res.send(response.body)
        })
})


router.get('/newcustomer', async (req, res) => {
    var customerName = "TestSoapCustomer";
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
    console.log(results);
    res.send('Soap request done!');
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
    console.log(parser.toJson(results));
    let object = JSON.parse(parser.toJson(results));
    let wordsTotal = object.projectMetrics.coreMetrics.totalWords;
    res.send(wordsTotal);
    }

    xhr.setRequestHeader('Content-Type', 'text/xml');
    xhr.send(str);
})

router.get('/editor', async (req, res) => {
    let str = '<?xml version="1.0" encoding="UTF-8"?>' +
    '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:pm="http://pm.v2.webservice.projectmanagergui.xmlintl.com/">' +
   '<soapenv:Header/>' +
   '<soapenv:Body>' +
      '<pm:obtainXTMEditorLink>' +
         '<loginAPI>' +
            '<client>Pangea</client>' +
            '<password>ling</password>' +
            '<userId>3155</userId>' +
         '</loginAPI>' +
         '<editor>' +
            '<customerDescriptor>' +
               '<id>23</id>' +
            '</customerDescriptor>' +
            '<jobDescriptor>' +
               '<id>5531</id>' +
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
                  '<id>2890</id>' +
                  '<workflowStep>Translate</workflowStep>' +
               '</currentWorkflowStep>' +
               '<lqaDecisionType>YES_SAVING_RESULTS_FOR_USER</lqaDecisionType>' +
               '<manageType>FINISH</manageType>' + 
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
    var results = xhr.responseText;
    res.send(results);
    }

    xhr.setRequestHeader('Content-Type', 'text/xml');
    xhr.send(str);
})

module.exports = router;