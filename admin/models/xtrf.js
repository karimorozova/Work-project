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
      name: "pangea-test",
      serviceId: request.service.xtrf,
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


    var data = new FormData();
    data.append('file', fs.readFileSync(filePath));

    var options = {
      headers: {
        'X-AUTH-ACCESS-TOKEN': 'U0mLa6os4DIBAsXErcSUvxU0cj',
        'Content-Type': 'multipart/form-data'
      }
    };

    httpRequest.post(`http://localhost:3000/incoming`,{options,data, 
    function (error, response, body) {
      if (error) {
        return console.error('upload failed:', error);
      }
      console.log('Upload successful!  Server responded with:', body);
    }});

    /*axios({
      method: 'POST',
      url: `https://pangea.s.xtrf.eu/home-api/v2/quotes/${quote}/files/upload`,
      headers: {
        'X-AUTH-ACCESS-TOKEN': 'U0mLa6os4DIBAsXErcSUvxU0cj',
        'Content-Type':'multipart/form-data'
      },
      file: data
    }).then(function (response) {
      console.log(`file uploaded, fileId: ${response.fileId}`);
    }).catch(function (error) {
      console.log(`error uploading file`);
    });*/

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

    var quoteId = await (customer.createQuote());
    console.log(`New Quoate ID is ${quoteId}`);

  } else {
    //adding smart quote
    //var quote = await (addQuote(customerId, request));
    //var srclang = await (setSrcLanguage("/v2/quotes/" + quote.id + "/sourceLanguage", request.sourceLanguage.xtrf));
    //var trgLang = await (setTargetLanguage("/v2/quotes/" + quote.id + "/targetLanguages", request.targetArray()));
    //uploadFiles(quote.id, request);
    uploadFiles("3B4F6AWC4ZDTPOJAEY4Z7RY5GU", request);
  }
  console.log("End of creation quote");

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



module.exports = Xtrf;
