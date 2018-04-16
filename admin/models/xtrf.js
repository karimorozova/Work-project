const axios = require('axios');
const Customer = require('./customer');

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
      console.log("errord adding customer, status " + error.response.status + "\n Message :" + error.response.data.errorMessage);
      resolve(error);
    });
  })
}

function generateToken(contactEmail) {
  return new Promise(resolve => {
    homeApi.post("customers/persons/accessToken", { 'loginOrEmail': contactEmail }).then(function (response) {
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

const Xtrf = async (request) => {
  
  var customerToken = await (generateToken(request.contactEmail))
  if (customerToken) {
    var sessionId = await (Customer.login(customerToken));
    var customer = new Customer(request,sessionId);
    await (customer.createQuote());
    //await (customer.workflows());
  }

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
