const axios = require('axios');
const querystring = require('querystring');


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

    clientInfo() {
        return new Promise(resolve => {
            this.clientApi.get("/projects")
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
        return new Promise(resolve => {
            var jsonData = {
                'name': `${this.request.companyName}`,
                "workflow": {
                    "name": "Translation [General]"
                },
                "specialization": {
                    "name": "General"
                },
                "sourceLanguage": this.request.sourceLangName(),
                "targetLanguages": this.request.targetLangName(),
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