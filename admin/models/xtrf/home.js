const axios = require('axios');

const homeXtrf = axios.create({
    baseURL: 'https://pangea.s.xtrf.eu/home-api/',
    headers: {
        'X-AUTH-ACCESS-TOKEN': 'U0mLa6os4DIBAsXErcSUvxU0cj'
    }
});

function findCustomer(name) {
    return new Promise(resolve => {
        homeApi.get("customers").then(function (response) {
            resolve(response.data.find(x => x.name == name).id);
        }).catch(function (error) {
            resolve(error);
        });
    })
}


module.exports = { findCustomer }