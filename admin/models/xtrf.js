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

const Xtrf = async (request) => {

  var customerId = await (createCustomer(request));
  if (customerId.response.status) {
    console.log("Looking for existing customer");
    customerId = await (findCustomer(request.companyName));
  }
  var personId = await (createPerson(request, customerId))
   

  return new Promise(resolve => {
    instance.post("v2/quotes", {
      clientId: customerId,
      name: "pangea-test",
      serviceId: request.service,
      opportunityOfferId: ""
    }).then(function (response) {
      resolve(response.data);
    }).catch(function (error) {
      resolve(error);
    });
  })
}


module.exports = Xtrf;
