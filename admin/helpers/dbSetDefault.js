const {
  Languages,
  Requests,
  Projects,
  User,
  Services,
  Industries,
  Ratesduo
} = require('../models');
const {
  languagesDefault,
  requestsDefault,
  projectsDefault,
  usersDefault,
  servicesDefault,
  industriesDefault,
  ratesduoDefault
} = require('./dbDefaultValue');

const axios = require('axios');

var instance = axios.create({
  baseURL: 'https://pangea.s.xtrf.eu/home-api/',
  headers: {
    'X-AUTH-ACCESS-TOKEN': 'U0mLa6os4DIBAsXErcSUvxU0cj'
  }
});

function languages() {
  return Languages.find({})
    .then(async languages => {
      if (!languages.length) {
         await instance.get("/dictionaries/language/all").then( async function (xtrfReq) {
          const xtrfLangs = xtrfReq.data;

          for (const lang of languagesDefault) {
            var addXtrfId = xtrfLangs.find(x => x.symbol == lang.symbol);
            lang.xtrf = addXtrfId.id;
          }
          // let count = 1;
          for (const lang of languagesDefault) {
            await new Languages(lang).save().then((lang) => {

            })
              .catch((err) => {
                console.log(`Lang: ${lang.lang} wasn't save. Because of ${err.message}`)
              });
          }
          console.log('Langs are saved!');
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

function projects() {
  Projects.find({})
    .then(projects => {
      if (!projects.length) {
        for (const proj of projectsDefault) {
          new Projects(proj).save()
            .then((res) => {
              //console.log(`Project: with name ${proj.projectId} was save!`)
            })
            .catch((err) => {
              console.log(`Project: with id ${proj.projectId} wasn't save. Because of ${err.message}`)
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
        instance.get('/users').then(res => {
          let usersArray = res.data;
          for(let person of usersArray) {
            instance.get(`/users/${person.id}`).then(res => {
              let newUser = {
                email: res.data.email,
                username: res.data.login,
                group: res.data.userGroupName,
                firstName: res.data.firstName,
                lastName: res.data.lastName,
                gender: res.data.gender,
                phone: res.data.mobilePhone,
                position: res.data.positionName,
                password: 12345
              };
              new User(newUser).save().
              then(user => {
                console.log(`User ${user.username} saved!`)
              })
              .catch((err) => {
                console.log(`User with ${person.id} wasn't save. Because of ${err.message}`)
              });
            })
            .catch((err) => {
              console.log(`Cannot get user with id: ${person.id} because of ${err.message}`)
            });
          }
        }).catch(err => {
          console.log('Cannot get users')
        })
      }
    })
    .catch(err => {
      console.log(err)
    })
}

function services() {
  return Services.find({})
    .then(async (services) => {
      if (!services.length) {
        for (const service of servicesDefault) {
          await new Services(service).save()
            .then((service) => {
              console.log(`Service ${service.title} was saved!`)
            })
            .catch((err) => {
              console.log(`Service ${service.title} wasn't saved. Because of ${err.message}`)
            });
        }
      }
    })
    .catch(err => {
      console.log(err)
    })
}

async function serviceMonoLangs() {
  let languages = await Languages.find();
  let services = await Services.find({"languageForm": "Mono"});
  let industries = await Industries.find();
  let rate = 0.12;
  for(let serv of services) {
    if(serv.title == 'Blogging') {
      rate = 0.1;
    }
    if(serv.title == 'SEO Writing') {
      rate = 0.15
    }
    for(let industry of industries) {
      industry.rate = rate;
      industry.package = 200;
    }
    if(!serv.languageCombinations.length) {
      for(let lang of languages) {
        if(serv.languages[0].target.indexOf(lang.symbol) != -1) { 
          serv.languageCombinations.push({
            target: lang,
            active: true,
            industries: industries
          })
        }
      }
      await Services.update({"title": serv.title}, serv);
    }
  }
}

async function serviceDuoLangs() {
  let languages = await Languages.find();
  let services = await Services.find({"languageForm": "Duo"});
  let industries = await Industries.find();
  let rate = 0.1;
  let englishLang = languages.find(item => {
    return item.symbol == "EN-GB"
  });

  for(let serv of services) {
    if(serv.title == 'Proofing') {
      rate = 0.025;
    }
    if(serv.title == 'QA and Testing') {
      rate = 0.05
    }
    for(let industry of industries) {
      industry.rate = rate
    }
    if(!serv.languageCombinations.length) {
    for(let lang of languages) {
      if(serv.languages[0].target.indexOf(lang.symbol) != -1 && lang.lang.indexOf('English') == -1) {
        serv.languageCombinations.push({
          source: englishLang,
          target: lang,
          active: true,
          industries: industries
        })
      }
      if(serv.languages[0].source.indexOf(lang.symbol) != -1 && lang.lang.indexOf('English') == -1) {
        serv.languageCombinations.push({
          source: lang,
          target: englishLang,
          active: true,
          industries: industries
        })
      }
    }
    await Services.update({"title": serv.title}, serv);
    }
  }  
}

function industries() {
  return Industries.find({}).then(async industries => {
    if (!industries.length) {
      for (var industry of industriesDefault) {
        console.log(industry.name);
        await new Industries(industry).save().then(industry => {
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
  await industries();
  await services();
  await requests();
  await projects();
  await users();
  await serviceMonoLangs();
  await serviceDuoLangs();
}

module.exports = checkCollections();
