const {
  Languages,
  Requests,
  User,
  Services,
  Industries
} = require('../models');
const {
  languagesDefault,
  requestsDefault,
  usersDefault,
  servicesDefault,
  industriesDefault
} = require('./dbDefaultValue');

const axios = require('axios');

var instance = axios.create({
  baseURL: 'https://pangea.s.xtrf.eu/home-api/',
  headers: {
    'X-AUTH-ACCESS-TOKEN': 'U0mLa6os4DIBAsXErcSUvxU0cj'
  }
});

function languages() {
  Languages.find({})
    .then(languages => {
      if (!languages.length) {
        instance.get("/dictionaries/language/all").then(function (xtrfReq) {
          const xtrfLangs = xtrfReq.data;

          for (const lang of languagesDefault) {
            var smth = xtrfLangs.find(x => x.symbol == lang.symbol);
            lang.xtrf = smth.id;

            if (lang.dialects) {
              for (const dialect of lang.dialects) {
                dialect.xtrf = xtrfLangs.find(x => x.symbol == dialect.symbol).id;
              }
            }
          }

          for (const lang of languagesDefault) {
            new Languages(lang).save().then((lang) => {

            })
              .catch((err) => {
                console.log(`Lang: ${lang.lang} wasn't save. Because of ${err.message}`)
              });
          }

          //resolve(response.data);
        }).catch(function (error) {
          console.log("error gettings xtrf langs");
        });


      }
    })
    .catch(err => {
      console.log(err)
    })
}

function requests() {
  Requests.find({})
    .then(requests => {
      if (!requests.length) {
        for (const req of requestsDefault) {
          new Requests(req).save()
            .then((lang) => {
              //console.log(`Request: with name ${req.contactName} was save!`)
            })
            .catch((err) => {
              console.log(`Request: with name ${req.contactName} wasn't save. Because of ${err.message}`)
            });
        }

      }
    })
    .catch(err => {
      console.log(err)
    })
}



function users() {
  User.find({})
    .then(users => {
      if (!users.length) {
        for (const user of usersDefault) {
          new User(user).save()
            .then((user) => {
              console.log(`User ${user.username} was save!`)
            })
            .catch((err) => {
              console.log(`User ${user.username} wasn't save. Because of ${err.message}`)
            });
        }

      }
    })
    .catch(err => {
      console.log(err)
    })
}

function services() {
  Services.find({})
    .then(services => {
      if (!services.length) {
        for (const service of servicesDefault) {
          new Services(service).save()
            .then((service) => {
              console.log(`Service ${service.title} was saved!`)
            })
            .catch((err) => {
              console.log(`Service ${service.title} wasn't saved. Because of ${err.message}`)
            });
        }
      }
    })
}

function industries() {
  Industries.find({}).then(industries => {
    //console.log("industries length :  " + industriesDefault.length);
    if (!industries.length) {
      for (var industry of industriesDefault) {
        console.log(industry.name);
        new Industries(industry).save().then(industry => {
          console.log(`industry ${industry.name} was saved!`);
        }).catch(err => {
          console.log(`Industry ${industry.name} wasn't saved. Because of ${err.message}`);
        });
      }
    }
  });
}

async function checkCollections() {
  await languages();
  await requests();
  await users();
  await services();
  await industries();
}

module.exports = checkCollections();
