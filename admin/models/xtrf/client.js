const axios = require('axios');
const querystring = require('querystring');
const fs =require('fs');
const unirest = require('unirest');


var ClientApi = class ClientApi {
    constructor(request, sessionId) {
        this.request = request;
        this.clientApi = axios.create({
            baseURL: 'https://pangea.s.xtrf.eu/customer-api/',
            withCredentials: true,
            headers: {
                'Cookie': 'JSESSIONID=' + sessionId,
                'Content-Type': 'application/json',
            }
        });
    }

    static login(customerToken) {
        return new Promise(resolve => {
            axios.post("https://pangea.s.xtrf.eu/customer-api/system/loginWithToken", querystring.stringify({
                accessToken: customerToken
            }))
                .then(function (response) {
                    resolve(response.data.jsessionid);
                }).catch(function (error) {
                    resolve(error);
                })
        })
    }

    static authUser(login, pass) {
        return new Promise(resolve => {
            axios.post("https://pangea.s.xtrf.eu/customer-api/system/login", querystring.stringify({
                username: login,
                password: pass
            }))
                .then(function (response) {
                    resolve(response.data.jsessionid);
                }).catch(function (error) {
                    resolve(error);
                })
        })
    }

    userInfo() {
        return new Promise(resolve => {
            this.clientApi.get("/system/session")
                .then(function (response) {
                    resolve(response);
                }).catch(function (error) {
                    resolve(error);
                })
        })
    }
    
    fullUserInfo(customerId, personId) {
        return new Promise(resolve => {
            this.clientApi.get(`/customers/${customerId}/persons/${personId}`)
                .then(function (response) {
                    resolve(response);
                }).catch(function (error) {
                    resolve(error);
                })
        })
    }

    companyInfo(customerId) {
        return new Promise(resolve => {
            this.clientApi.get(`/customers/${customerId}`)
                .then(function(response) {
                    resolve(response)
                }).catch(function(error) {
                    resolve(error);
                })
        })
    }

    languageComb(customerId) {
        return new Promise(resolve => {
            this.clientApi.get(`/customers/${customerId}/sales/languageCombinations`)
                .then(function(response) {
                    resolve(response)
                }).catch(function(error) {
                    resolve(error);
                })
        })
    }

    projectsInfo() {
        return new Promise(resolve => {
            this.clientApi.get("/projects")
                .then(function(response) {
                    resolve(response)
                }).catch(function(error) {
                    resolve(error);
                })
        })
    }

    projectFilesDownload(projectId) {
        return new Promise(resolve => {
 
            this.clientApi.get(`/projects/${projectId}/files/outputFilesAsZip`)
                .then(function(response) {
                    const blob = new Blob([JSON.stringify(response.data)]);

                    resolve(response)
                }).catch(function(error) {
                    resolve(error);
                })
        })
    }

    quotesInfo() {
        return new Promise(resolve => {
            this.clientApi.get("/quotes")
                .then(function(response) {
                    resolve(response)
                }).catch(function(error) {
                    resolve(error);
                })
        })
    }

    quoteApprove(id) {
        return new Promise(resolve => {
            this.clientApi.put(`/quotes/${id}/acceptance`)
                .then(function(response) {
                    resolve(response)
                }).catch(function(error) {
                    resolve(error);
                })
        })
    }

    quoteReject(id) {
        return new Promise(resolve => {
            this.clientApi.delete(`/quotes/${id}/acceptance`)
                .then(function(response) {
                    resolve(response)
                }).catch(function(error) {
                    resolve(error);
                })
        })
    }

    getName() {
        return new Promise(resolve => {
            this.clientApi.get("system/account")
                .then(function (response) {
                    resolve(response);
                }).catch(function (error) {
                    resolve(error);
                })
        })
    }

    createQuote() {
        const srcLang = this.request.sourceLangName();
        const trgLang = this.request.targetLangName();
        var name = this.request.companyName;
        if(this.request.projectName) {
            name = this.request.projectName;
        }
        var filesArr = [];
        const fileFolder = `./dist/reqfiles/${this.request.id}`;
        fs.readdirSync(fileFolder).forEach(file => {
            filesArr.push(file)
        })
        // for(let i = 0; i < filesArr.length; i++) {
        //     this.clientApi.post('https://pangea.s.xtrf.eu/customer-api/system/session/files', fs.readFile(`./dist/reqfiles/${this.request.id}/`+ filesArr[i]))
        //     .then( response => console.log(response))
        //     .catch(err => console.log(err))
        // }        
        return new Promise(resolve => {
            var jsonData = {
                'name': `${name}`,
                "workflow": {
                    "name": "Translation & Proofreading [General]"
                },
                "specialization": {
                    "name": "General"
                },
                // "files": `${this.request.detailFiles}`,
                // "referenceFiles": `${this.request.refFiles}`,
                "sourceLanguage": srcLang,
                "targetLanguages": trgLang,
                "notes": "Coming from website",
                "autoAccept": false
            };
            this.clientApi.post("quotes", jsonData).then(function (response) {
                resolve(response);
            }).catch(function (error) {
                resolve(error);
            })
        })
    }

}
module.exports = ClientApi;