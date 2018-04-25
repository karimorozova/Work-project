const axios = require('axios');
const querystring = require('querystring');

var FormData = require('form-data');
var fs = require('fs');
var httpRequest = require("request");

var Customer = class Customer {
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
  
  static authUser(login, pass ) {
    return new Promise(resolve => {
      axios.post("https://pangea.s.xtrf.eu/customer-api/system/login", querystring.stringify({
        username: login,
        password : pass
        }))
        .then(function (response) {
          resolve(response.data.jsessionid);
        }).catch(function (error) {
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

  workflows() {
    return new Promise(resolve => {
      this.clientApi.get("system/values/workflows")
        .then(function (response) {
          resolve(response);
        }).catch(function (error) {
          resolve(error);
        })
    })
  }
  specialization() {
    return new Promise(resolve => {
      this.clientApi.get("system/values/specializations")
        .then(function (response) {
          resolve(response);
        }).catch(function (error) {
          resolve(error);
        })
    })
  }

  langs() {
    return new Promise(resolve => {
      this.clientApi.get("system/values/languages")
        .then(function (response) {
          console.log(response.data);
          resolve(response);
        }).catch(function (error) {
          resolve(error);
        })
    })
  }

  uploadFiles(sessionId) {
    for (let i = 0; i < this.request.detailFiles.length; i += 1) {

      let filePath = `./dist/reqfiles/${this.request.id}/${this.request.detailFiles[i]}`;
      var formData = {
        'file': fs.createReadStream(filePath)
      };
  
      var options = {
        uri: `https://pangea.s.xtrf.eu/customer-api/system/session/files`,
        method: 'POST',
        headers: {
          'Cookie': 'JSESSIONID=' + sessionId,
          'X-AUTH-ACCESS-TOKEN': 'U0mLa6os4DIBAsXErcSUvxU0cj',
          'Content-Type': 'multipart/form-data'
        },
        formData: formData,
      };
      httpRequest(options, (error, response, body) => {
        if (!error && response.statusCode == 200) {
          console.log("File send, new file id " + body);
        }
      });
    }
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

};
module.exports = Customer;
