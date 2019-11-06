const unirest = require('unirest');
const fs = require('fs');
const request = require('request');
const { XMLHttpRequest } = require("xmlhttprequest");
const { xtmToken, xtmBaseUrl } = require('../configs/');
const { taskMetricsCalc, metricsCalc } = require('../сalculations/wordcount');
const { Clients } = require('../models');

function getXtmCustomers() {
    return new Promise((resolve, reject) => {
        unirest.get(`${xtmBaseUrl}/rest-api/customers`)
            .headers({"Authorization": xtmToken,
            'Content-Type': 'application/json'}) 
            .end((response) => {
                if(response.error) {
                    console.log("err in getXtmCustomers");
                    reject(response.error);
                }
                resolve(response.body);
            })
    })
}

function saveTasks(object) {
    return new Promise(resolve => {
        unirest.post(`${xtmBaseUrl}/rest-api/projects`)
        .headers({"Authorization": xtmToken,
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
    const formData = getDataForRequest(object);
    return new Promise((resolve, reject) => {
        request.post({
            url: `${xtmBaseUrl}/rest-api/projects`,
            headers: {
                "Authorization": xtmToken,
                "Content-Type": "multipart/form-data"
            },
            formData }, function(err, httpResponse, body) {
                if(err) {
                    reject(err);
                }
                resolve(body);
            }
        )
    })    
}

function getEditorUrl({jobId, stepName, xtmProjectId}) {
    return new Promise((resolve, reject) => {
        unirest.post(`${xtmBaseUrl}/project-manager-api-rest/projects/${xtmProjectId}/links/editor`)
        .headers({"Authorization": xtmToken,
        'Content-Type': 'application/json'})
        .send({ 
            "editorMode": "STANDARD",
            "externaluser": {
                "id": 20,
                "name": "admin"
            },
            "jobs": [{jobId}],
            stepName,
            "userId": 20
        })
        .end(response => {
            if(response.err) {
                reject(err);
            }
            resolve(response.body)
        })
    })
}

function getDataForRequest(object) {
    const withJoinObject = object.join && object.join !== "false" ? {
        'workflowId': object.workflowId,
        'fileProcessType': 'JOIN'
    } : {'workflowId': object.workflowId}
    const filesObj = {};
    if(object.sourceFiles.length) {
        for(let index in object.sourceFiles) {
            filesObj[`translationFiles[${index}].file`] = fs.createReadStream(object.sourceFiles[index]);
        }
    }
    if(object.refFiles && object.refFiles.length) {
        for(let index in refFiles) {
            filesObj[`referenceFiles[${index}].file`] = fs.createReadStream(object.refFiles[index]);
        }
    }
    return {
        customerId: object.customerId,
        name: object.name,
        sourceLanguage: object.source,
        targetLanguages: object.target,
        analysisTemplateId: object.templateId,
        ...withJoinObject,
        ...filesObj
    }
}

function getMetrics({projectId, customerId}) {
    return new Promise((resolve, reject) => {
        unirest.get(`${xtmBaseUrl}/rest-api/projects/${projectId}/metrics`)
        .headers({"Authorization": xtmToken,
        'Content-Type': 'application/json'})
        .end(async (response) => {
            if(response.error) {
                console.log("Error in getMetrics");
                reject(response.error);
            }
            try {
                const metrics = response.body[0];
                const { xtmMetrics, progress } = await metricsCalc(metrics);
                const customer = await Clients.findOne({"_id": customerId});    
                const taskMetrics = taskMetricsCalc({metrics: xtmMetrics, matrix: customer.matrix, prop: 'client'});
                resolve({taskMetrics, progress});
            } catch(err) {
                console.log("Error in getMetrics");
                reject(err);
            }
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
        
        let xhr = createCORSRequest("POST", `${xtmBaseUrl}/project-manager-gui/services/v2/XTMProjectManagerMTOMWebService?wsdl`);
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

function getRequestOptions(obj) {
    return {
        hostname: 'wstest2.xtm-intl.com',
        path: `/rest-api/${obj.path}`,
        method: obj.method,
        headers: { 'Authorization': xtmToken }
    };
}

function generateTargetFile({projectId, jobId}) {
    return new Promise((resolve, reject) => {
        unirest.post(`${xtmBaseUrl}/rest-api/projects/${projectId}/files/generate?jobIds=${jobId}&fileType=TARGET`)
            .headers({"Authorization": xtmToken})
            .end( (response) => {
                if(response.error) {
                   reject(response.error);
                }
                resolve(response.body);
            }) 
    })
}

function getTaskProgress(task) {
    return new Promise((resolve, reject) => {
        unirest.get(`${xtmBaseUrl}/rest-api/projects/${task.projectId}/metrics`)
        .headers({"Authorization": xtmToken,
        'Content-Type': 'application/json'})
        .end(async (response) => {
            if(response.error) {
                console.log(response.error);
                reject(response.error);
            }
            const metrics = response.body[0];
            try {
                const { progress } = await metricsCalc(metrics);
                resolve({progress});
            } catch(err) {
                console.log(err);
                reject(err);
            }
        })
    })
}

module.exports = { getXtmCustomers, saveTasks, saveTemplateTasks, getMetrics, createNewXtmCustomer, getRequestOptions, getTaskProgress, generateTargetFile, getEditorUrl };