const unirest = require('unirest');
const https = require('https');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const parser = require('xml2json');

function saveJobs(object) {

    return new Promise(resolve => {
        unirest.post('http://wstest2.xtm-intl.com/rest-api/projects')
        .headers({"Authorization": "XTM-Basic lGoRADtSF14/TQomvOJnHrIFg5QhHDPwrjlgrQJOLtnaYpordXXn98IwnSjt+7fQJ1FpjAQz410K6aGzYssKtQ==",
        'Content-Type': 'multipart/form-data'}) 
        .field('customerId', 23)
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

module.exports = { saveJobs };