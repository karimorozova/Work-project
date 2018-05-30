const axios = require('axios');

const homeXtrf = axios.create({
    baseURL: 'https://pangea.s.xtrf.eu/home-api/',
    headers: {
        'X-AUTH-ACCESS-TOKEN': 'U0mLa6os4DIBAsXErcSUvxU0cj'
    }
});

function createCustomer(request) {
    return new Promise(resolve => {
        homeXtrf.post("customers", {
            name: request.companyName,
            fullName: request.contactName,
            contact: {
                emails: {
                    primary: request.contactEmail
                }
            },
        }).then(function (response) {
            resolve(response.data.id);
        }).catch(function (error) {
            console.log("errord adding customer, status " + error.response.status + "\n Message :" + error.response.data.errorMessage);
            resolve(error);
        });
    })
}
function findCustomer(name) {
    return new Promise(resolve => {
        homeXtrf.get("customers").then(function (response) {
            const customer = response.data.find(x => x.name == name);
            if(customer){
                resolve(customer.id);
            }
            else{
                resolve(undefined);
            }                
        }).catch(function (error) {
            resolve(error);
        });
    })
}

function setSrcLanguage(url, srcLanguage) {
    return new Promise(resolve => {
        homeXtrf.put(url, {
            sourceLanguageId: srcLanguage,
        }).then(function (response) {
            resolve(response.data);
        }).catch(function (error) {
            resolve(error);
        });
    })
}

function setTargetLanguage(url, trgLanguage) {
    return new Promise(resolve => {
        homeXtrf.put(url, {
            targetLanguageIds: trgLanguage,
        }).then(function (response) {
            resolve(response.data);
        }).catch(function (error) {
            resolve(error);
        });
    })
}

function deadlineAdd(url, date) {
    return new Promise(resolve => {
        homeXtrf.put(url, {
            value: date,
        }).then(function (response) {
            resolve(response.data);
        }).catch(function (error) {
            resolve(error);
        });
    })
}

function addQuote(customerId, request) {
    return new Promise(resolve => {
        var projectName;
        if (request.projectName) {
            projectName = request.projectName;
        } else {
            projectName = request.service.title + " - " + request.industry;
        }
        homeXtrf.post("v2/quotes", {
            clientId: customerId,
            name: projectName,
            serviceId: request.service.xtrf,
            opportunityOfferId: ""
        }).then(function (response) {
            resolve(response.data);
        }).catch(function (error) {
            resolve(error);
        });
    })
}

function addSmartProject(customerId, request) {
    return new Promise(resolve => {
        var projectName;
        if (request.projectName) {
            projectName = request.projectName;
        } else {
            projectName = request.service.title + " - " + request.industry;
        }
        homeXtrf.post("v2/projects", {
            clientId: customerId,
            name: projectName,
            serviceId: request.service.xtrf
        }).then(function (response) {
            resolve(response.data);
        }).catch(function (error) {
            resolve(error);
        });
    })
}

function addClassicProject(customerId, request) {
    return new Promise(resolve => {
        homeXtrf.get("dictionaries/specialization/all").then(specs => {
            var industryId;
            var targetLangs = [];
            
            for(let i = 0; i < specs.data.length; i++) {
                if(specs.data[i].name == request.industry) {
                    industryId = specs.data[i]
                }
            }
            
            for(let j = 0; j < request.targetLanguages.length; j++) {
                targetLangs.push(request.targetLanguages[j].id)
            }
            const startDate = Date.now();
            const endDate = request.date.getTime();
            homeXtrf.post("projects", {
                "customerId": customerId,
                "sourceLanguageId": request.sourceLanguage.id,
                "specializationId": industryId.id,
                "targetLanguagesIds": targetLangs,
                "serviceId": request.service.xtrf,
                "dates": {
                  "startDate": {
                    "time": startDate
                  },
                  "deadline": {
                    "time": endDate
                  }
                },
                "name": request.projectName
            }).then(function (response) {
                resolve(response.data);
            }).catch(function (error) {
                resolve(error);
            })  
        }).catch(err=> console.log(err))
    })
}

function generateToken(contactEmail) {
    return new Promise(resolve => {
        homeXtrf.post("customers/persons/accessToken", {
            'loginOrEmail': contactEmail
        }).then(function (response) {
            resolve(response.data.token);
        }).catch(function (error) {
            resolve(error);
        });
    })
}

function getSpecializations() {
    return new Promise(resolve => {
        homeXtrf.get("dictionaries/specialization/all").then(response =>
            resolve(response.data))
        }).catch(function (error) {
            resolve(error);
        });
}


module.exports = { findCustomer, addQuote, setTargetLanguage, setSrcLanguage, deadlineAdd, generateToken, createCustomer, addClassicProject, addSmartProject }