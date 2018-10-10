const unirest = require('unirest');
const { XMLHttpRequest } = require("xmlhttprequest");

function saveTasks(object) {

    return new Promise(resolve => {
        unirest.post('http://wstest2.xtm-intl.com/rest-api/projects')
        .headers({"Authorization": "XTM-Basic lGoRADtSF14/TQomvOJnHrIFg5QhHDPwrjlgrQJOLtnaYpordXXn98IwnSjt+7fQJ1FpjAQz410K6aGzYssKtQ==",
        'Content-Type': 'multipart/form-data'}) 
        .field('customerId', object.customerId)
        .field('name', object.name)
        .field('sourceLanguage', object.source)
        .field('targetLanguages', object.target)
        .field('workflowId', 2890)
        .attach('translationFiles[0].file', object.file)
        .end(response => {
            resolve(response)
        })
    })
    
}

function saveTemplateTasks(object) {
    return new Promise((resolve, reject) => {
        unirest.post('http://wstest2.xtm-intl.com/rest-api/projects')
        .headers({"Authorization": "XTM-Basic lGoRADtSF14/TQomvOJnHrIFg5QhHDPwrjlgrQJOLtnaYpordXXn98IwnSjt+7fQJ1FpjAQz410K6aGzYssKtQ==",
        'Content-Type': 'multipart/form-data'}) 
        .field('customerId', object.customerId)
        .field('name', object.name)
        .field('sourceLanguage', object.source)
        .field('targetLanguages', object.target)
        .field('analysisTemplateId', object.templateId)
        .field('workflowId', object.workflowId)
        .attach('translationFiles[0].file', object.file)
        .end(response => {
            if(response.error) {
                return reject(response.error)
            }
            resolve(response.body)
        })
    })    
}

function getMetrics(projectId) {
    return new Promise((resolve, reject) => {
        unirest.get(`http://wstest2.xtm-intl.com/rest-api/projects/${projectId}/metrics`)
        .headers({"Authorization": "XTM-Basic lGoRADtSF14/TQomvOJnHrIFg5QhHDPwrjlgrQJOLtnaYpordXXn98IwnSjt+7fQJ1FpjAQz410K6aGzYssKtQ==",
        'Content-Type': 'application/json'})
        .end(response => {
            if(response.error) {
                return reject(response.error)
            }
            resolve(response.body)
        })
    })
}

function createNewXtmCustomer(name) {
    const customerName = name;
    return new Promise((resolve, reject) => {
        const str = `<?xml version="1.0" encoding="UTF-8"?>
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:pm="http://pm.v2.webservice.projectmanagergui.xmlintl.com/">
        <soapenv:Header/>
        <soapenv:Body>
        <pm:createCustomer>
            <loginAPI>
                <client>Pangea</client>
                <password>pm</password>
                <userId>3150</userId>
            </loginAPI>
            <customer>
                <customerBase>
                <name>${customerName}</name>
                </customerBase>
            </customer>
            <options/>
        </pm:createCustomer>
        </soapenv:Body>
        </soapenv:Envelope>`;
        
        let xhr = createCORSRequest("POST", "http://wstest2.xtm-intl.com/project-manager-gui/services/v2/XTMProjectManagerMTOMWebService?wsdl");
        if(!xhr){
        console.log("XHR issue");
        return;
        }

        xhr.onload = function (){
            let results = xhr.responseText;
            let id;
            if(results.indexOf('<id>') != -1) {
                results = results.split('<id>')[1];
                id = results.split("</id>")[0];
                resolve(id);
            } else {
                reject("Error on XHR onload wjile creating a new xtm customer");
            }
        }

        xhr.setRequestHeader('Content-Type', 'text/xml');
        xhr.send(str);
    })
}
    
function createCORSRequest(method, url) {
    let xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr) {
        xhr.open(method, url, false);
    } else if (typeof XDomainRequest != "undefined") {
        xhr = new XDomainRequest();
        xhr.open(method, url);
    } else {
        console.log("CORS not supported");
        xhr = null;
    }
    return xhr;
}

module.exports = { saveTasks, saveTemplateTasks, getMetrics, createNewXtmCustomer };