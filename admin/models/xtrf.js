const axios = require('axios');

var instance = axios.create({
  baseURL: 'https://pangea.s.xtrf.eu/home-api/',
  headers: {
    'X-AUTH-ACCESS-TOKEN': 'U0mLa6os4DIBAsXErcSUvxU0cj'
  }
});

function createCustomer(customer) {
  return new Promise(resolve => {
    instance.post("customers", {
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
    instance.get("customers").then(function (response) {
      resolve(response.data.find(x => x.name == name).id);
    }).catch(function (error) {
      console.log("errord adding customer, status " + error.response.status + "\n Message :" + error.response.data.errorMessage);
      resolve(error);
    });
  })
}

function createPerson(person, clientId) {
  return new Promise(resolve => {
    instance.post("customers/persons", {
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
    instance.post("v2/quotes", {
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

function addClassicQuote(customerId, request) {
  return new Promise(resolve => {
    instance.post("quotes", {
      clientId: customerId,
      name: "pangea-test",
      serviceId: request.service.xtrf
    }).then(function (response) {
      resolve(response.data);
    }).catch(function (error) {
      resolve(error);
    });
  })
}

function setSrcLanguage(url, srcLanguage) {
  return new Promise(resolve => {
    instance.put(url, {
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
    instance.put(url, {
      targetLanguageIds: trgLanguage,
    }).then(function (response) {
      resolve(response.data);
    }).catch(function (error) {
      resolve(error);
    });
  })
}

function uploadFiles(quote, request)
{
  var quoteId = 'BWOD7LST25CP3PM7CMGS35X4GA';
  var reqId = '5ad0bfdaf82f7a7972e9f32d';
  var fileName = 'TH.png';
  for(var file in request.detailFiles)
  {
    var data = new FormData();
    data.append(file, fs.createReadStream('/foo/bar.jpg'))
  }

}

const Xtrf = async (request) => {

 
  var customerId = await (createCustomer(request));

  //uploadFiles();
  /*if (customerId.response && customerId.response.status) {
    console.log("Looking for existing customer");
    customerId = await (findCustomer(request.companyName));
  }
  var personId = await (createPerson(request, customerId));
  if (request.service.projectType == "smart") {
    var quote = await (addQuote(customerId, request));
    var srclang = await (setSrcLanguage("/v2/quotes/" + quote.id + "/sourceLanguage", request.sourceLanguage.xtrf));
    var trgLang = await (setTargetLanguage("/v2/quotes/" + quote.id + "/targetLanguages", request.targetArray()));
  }
  /*else{
    var project = await (addClassicQuote(customerId, request));
    var srclang = await (setSrcLanguage("/v2/projects/" + project.id + "/sourceLanguage", request.sourceLanguage.xtrf));
    var trgLang = await (setTargetLanguage("/v2/projects/" + project.id + "/targetLanguages", request.targetArray()));
  }*/


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
