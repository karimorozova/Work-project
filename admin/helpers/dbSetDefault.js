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

            if (lang.dialects) {
              for (const dialect of lang.dialects) {
                dialect.xtrf = xtrfLangs.find(x => x.symbol == dialect.symbol).id;
              }
            }
          }
          // let count = 1;
          for (const lang of languagesDefault) {
            if(!lang.dialects) {
              lang.dialects = null;
            }
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
  let languages = await allLanguages();
  let services = await Services.find({"languageForm": "Mono"});
  for(let serv of services) {
    if(!serv.languageCombinations.length) {
      for(let lang of languages) {
        if(serv.languages[0].target.indexOf(lang.symbol) != -1) { 
          serv.languageCombinations.push({
            source: null,
            target: lang
          })
        }
      }
    }
    await Services.update({"title": serv.title}, serv);
  }
}

async function serviceDuoLangs() {
  let languages = await allLanguages();
  let services = await Services.find({"languageForm": "Duo"});
  let englishLangs = [];

  for(let language of languages) {
    if(language.lang.indexOf("English") != -1) {
      englishLangs.push(language);
    }
  }

  for(let serv of services) {
    if(!serv.languageCombinations.length) {
    for(let lang of languages) {
      if(serv.languages[0].target.indexOf(lang.symbol) != -1) {
        for(let eng of englishLangs) {
          serv.languageCombinations.push({
            source: eng,
            target: lang
          })
        }
      }
      if(serv.languages[0].source.indexOf(lang.symbol) != -1) {
        for(let eng of englishLangs) {
          serv.languageCombinations.push({
            source: lang,
            target: eng
          })
        }
      }
    }
    await Services.update({"title": serv.title}, serv);
    }
  }

  
}

function industries() {
  Industries.find({}).then(industries => {
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

async function allLanguages() {
  let result = [];
  let languages = await Languages.find();
  for(let i = 0; i < languages.length; i++) {
    result.push(languages[i]);
    if(languages[i].dialects) {
      for(let j = 0; j < languages[i].dialects.length; j++) {
        result.push(languages[i].dialects[j])
      }
    }
  }
  let copy = JSON.stringify(result);
  copy = JSON.parse(copy);
  for(let lang of copy) {
    lang.dialects = null;
  }
  return copy;
}

async function ratesduo(titleName) {
  let findService = await Services.find({'title': titleName});
  if(!findService[0].rates.length) {
    var service = servicesDefault.find(item => {
      if(item.title == titleName) {
        return item;
      }
    })
    let allLangs = await allLanguages();
    let ratesSource = allLangs.filter(item => {
      if(service.languages.source.indexOf(item.symbol) > 0) {
        return item;
      }
    });

    let ratesTarget = allLangs.filter(item => {
      if(service.languages.target.indexOf(item.symbol) > 0) {
        return item;
      }
    });

    let serviceRate = 0.1;
    if(titleName == 'Proofing') {
      serviceRate = 0.025
    }
    if(titleName == 'QA and Testing') {
      serviceRate = 0.05
    }

    let industries = industriesDefault.map(item => {
      item.rate = serviceRate;
      return item
    });

    industries.push({name: 'All', rate: serviceRate, crud: true});
    for(let i = 0; i < ratesSource.length; i++) {
      if(ratesSource[i].symbol == 'EN' || ratesSource[i].symbol == 'EN-GB' || ratesSource[i].symbol == 'EN-US') {
        for(let j = 0; j < ratesTarget.length; j++) {
          service.rates.push({
            source: ratesSource[i],
            target: ratesTarget[j],
            industry: industries
          })
        }
      }
      else {
        let targetLang = ratesTarget.find(item => {return item.symbol == 'EN-GB'});
        service.rates.push({
          source: ratesSource[i],
          target: targetLang,
          industry: industries
        })
      }
    }
    Services.update({'title': titleName}, service)
    .then(res => {
      console.log(`Rates to service ${titleName} added`)
    })
  } 
}

async function checkCollections() {
  await languages();
  await services();
  await requests();
  await projects();
  await users();
  await industries();
  await ratesduo("Translation");
  await ratesduo("Proofing");
  await ratesduo("QA and Testing");
  await serviceMonoLangs();
  await serviceDuoLangs();
}

module.exports = checkCollections();
