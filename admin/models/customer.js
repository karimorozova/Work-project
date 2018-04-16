const axios = require('axios');
const querystring = require('querystring');

var Customer = class Customer {
    constructor(request, sessionId) {
        this.request = request;
        this.clientApi = axios.create({
            baseURL: 'https://pangea.s.xtrf.eu/customer-api/',
            withCredentials: true,
            headers:{
                'Cookie': 'JSESSIONID=' + sessionId,
                'Content-Type' : 'application/x-www-form-urlencoded',
            }
        });
        //this.sessionId = ;
    }

    static login(customerToken) {
        return new Promise(resolve => {
            axios.post("https://pangea.s.xtrf.eu/customer-api/system/loginWithToken", querystring.stringify({ accessToken: customerToken }))
                .then(function (response) {
                    resolve(response.data.jsessionid);
                }).catch(function (error) {
                    resolve(error);
                })
        })
    }

    workflows() {
        return new Promise(resolve => {
            this.clientApi.get("system/values/workflows")
                .then(function (response) {
                    console.log(response.data);
                    resolve(response);
                }).catch(function (error) {
                    resolve(error);
                })
        })
    }

    createQuote() {
        return new Promise(resolve => {
            var data = querystring.stringify({
                name: "client-api quote",
                service: this.request.service.xtrf,
            })
            this.clientApi.post("quotes", data)
                .then(function (response) {
                    resolve(response);
                }).catch(function (error) {
                    resolve(error);
                })
        })
    }

};
module.exports = Customer;