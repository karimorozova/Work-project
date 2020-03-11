const unirest = require('unirest');
const fs = require('fs');
const { XMLHttpRequest } = require("xmlhttprequest");
const { xtmToken, xtmBaseUrl } = require('../configs/');

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

module.exports = { createNewXtmCustomer };