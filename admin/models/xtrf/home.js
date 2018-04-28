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

function addQuote(customerId, request) {
    return new Promise(resolve => {
        homeXtrf.post("v2/quotes", {
            clientId: customerId,
            name: request.service.title + " - " + request.industry,
            serviceId: request.service.xtrf,
            opportunityOfferId: ""
        }).then(function (response) {
            resolve(response.data);
        }).catch(function (error) {
            resolve(error);
        });
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


module.exports = { findCustomer, addQuote, setTargetLanguage, setSrcLanguage, generateToken, createCustomer }