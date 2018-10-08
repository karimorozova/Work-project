const unirest = require('unirest');

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

module.exports = { saveTasks, saveTemplateTasks, getMetrics };