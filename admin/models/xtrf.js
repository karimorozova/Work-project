const axios = require('axios');
const Customer = require('./customer');
var FormData = require('form-data');
var fs = require('fs');
var httpRequest = require("request");


var homeApi = axios.create({
  baseURL: 'https://pangea.s.xtrf.eu/home-api/',
  headers: {
    'X-AUTH-ACCESS-TOKEN': 'U0mLa6os4DIBAsXErcSUvxU0cj'
  }
});

function createCustomer(customer) {
  return new Promise(resolve => {
    homeApi.post("customers", {
      name: customer.companyName,
      fullName: customer.contactName,
      contact: {
        emails: {
          primary: customer.contactEmail
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
    homeApi.get("customers").then(function (response) {
      resolve(response.data.find(x => x.name == name).id);
    }).catch(function (error) {
      resolve(error);
    });
  })
}

function generateToken(contactEmail) {
  return new Promise(resolve => {
    homeApi.post("customers/persons/accessToken", {
      'loginOrEmail': contactEmail
    }).then(function (response) {
      resolve(response.data.token);
    }).catch(function (error) {
      resolve(error);
    });
  })
}

function createPerson(person, clientId) {
  return new Promise(resolve => {
    homeApi.post("customers/persons", {
      name: person.contactName,
      customerId: clientId,
      contact: {
        emails: {
          primary: person.contactEmail
        }
      },
    }).then(function (response) {
      resolve(response.data.id);
    }).catch(function (error) {
      console.log(error);
    });
  })
}

function addQuote(customerId, request) {
  return new Promise(resolve => {
    homeApi.post("v2/quotes", {
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

function createSmartQuote(request) {
  return new Promise(resolve => {
    homeApi.post("v2/quotes", {
      clientId: request.clientId,
      name: request.name,
      serviceId: request.serviceId,
      opportunityOfferId: ""
    }).then(function (response) {
      resolve(response.data);
    }).catch(function (error) {
      resolve(error);
    });
  })
}

function setSrcLanguage(url, srcLanguage) {
  return new Promise(resolve => {
    homeApi.put(url, {
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
    homeApi.put(url, {
      targetLanguageIds: trgLanguage,
    }).then(function (response) {
      resolve(response.data);
    }).catch(function (error) {
      resolve(error);
    });
  })
}

function uploadFiles(quote, request) {

  for (let i = 0; i < request.detailFiles.length; i += 1) {

    let filePath = `./dist/reqfiles/${request.id}/${request.detailFiles[i]}`;
    var formData = {
      'file': fs.createReadStream(filePath)
    };

    var options = {
      uri: `https://pangea.s.xtrf.eu/home-api/v2/quotes/${quote}/files/upload`,
      method: 'POST',
      headers: {
        'X-AUTH-ACCESS-TOKEN': 'U0mLa6os4DIBAsXErcSUvxU0cj',
        'Content-Type': 'multipart/form-data'
      },
      formData: formData,
    };

    function callback(error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log("File send, new file id " + body);
      }
    }

    httpRequest(options, callback);
  }
}

const Xtrf = async (request) => {

  console.log("Begin creating quote");
  const classic = request.service.projectType === "regular";
  console.log(`Project is regular : ${classic}`);

  var customerId = await (findCustomer(request.companyName));

  if (classic) {
    //adding classic quote
    var accessToken = await (generateToken(request.contactEmail));
    var sessionId = await (Customer.login(accessToken));

    console.log(`Customer id : ${customerId} \nAcess Token is : ${accessToken} \nSessionId is : ${sessionId}`);

    var customer = new Customer(request, sessionId);
    var files = customer.uploadFiles(sessionId);
    var quoteId = await (customer.createQuote());
    console.log(`New Quoate ID is ${quoteId}`);

  } else {
    //adding smart quote
    var quote = await (addQuote(customerId, request));
    var srclang = await (setSrcLanguage("/v2/quotes/" + quote.id + "/sourceLanguage", request.sourceLanguage.xtrf));
    var trgLang = await (setTargetLanguage("/v2/quotes/" + quote.id + "/targetLanguages", request.targetArray()));
    uploadFiles(quote.id, request);
  }
  console.log("End of creation quote");

}

const SmartProject = async (request) => {

    console.log("Begin create project");
    var quote = await (createSmartQuote(request));
    var langIds = [];
    for(let i = 0; i < request.jobs.length; i++) {
      langIds.push(`${request.jobs[i].targetLang.xtrf}`)
    };
    var trgLang = await (setTargetLanguage("/v2/quotes/" + quote.id + "/targetLanguages", langIds));
    console.log("trgLang : " + trgLang);
}



/* help debug function */
function getServiceList() {
  return new Promise(resolve => {
    instance.get("services/all").then(function (response) {
      resolve(response.data);
    }).catch(function (error) {
      resolve(error);
    });
  })
}



module.exports = { Xtrf, SmartProject };
