const {
  Languages,
  Requests,
  Projects,
  User,
  Services,
  Industries,
  Duorate,
  Monorate,
  Timezones,
  LeadSource,
  Clients,
  Vendors
} = require('../models');

const {
  languagesDefault,
  requestsDefault,
  projectsDefault,
  usersDefault,
  servicesDefault,
  industriesDefault,
  timezonesDefault,
  leadSourcesDefault,
  clientsDefault,
  vendorsDefault
} = require('./dbDefaultValue');

const axios = require('axios');

var instance = axios.create({
  baseURL: 'https://pangea.s.xtrf.eu/home-api/',
  headers: {
    'X-AUTH-ACCESS-TOKEN': 'U0mLa6os4DIBAsXErcSUvxU0cj'
  }
});

function fillLeadSources() {
  return LeadSource.find({})
    .then(async sources => {
      if(!sources.length) {
        for(const source of leadSourcesDefault) {
          await new LeadSource({ source }).save().then((times) => {

          }).catch(err => {
            console.log(`Leadsource ${source} hasn't been saved because of ${err.message}`)
          })
        }
        console.log('Leadsources are saved!')
      }
    })
    .catch(err => {
      console.log('Something is wrong' + err)
    })
}

function timeZones() {
  return Timezones.find({})
    .then(async timezones => {
      if(!timezones.length) {
        for(const time of timezonesDefault) {
          await new Timezones({zone: time}).save().then((times) => {

          }).catch(err => {
            console.log(`Timezone ${time} hasn't been saved because of ${err.message}`)
          })
        }
        console.log('Timezones are saved!')
      }
    })
    .catch(err => {
      console.log('Something is wrong' + err)
    })
}

function clients() {
    return Clients.find({})
      .then(async clients => {
        if(!clients.length) {
          for(const client of clientsDefault) {
            let industries = await Industries.find({});
            for(let industry of industries) {
              for(let ind in client.industry) {
                if(industry.name == client.industry[ind].name) {
                  client.industry[ind] = industry._id;
                }
              }
            }
            await new Clients(client).save().then(res => {
              console.log(`Client ${client.name} saved!`)
            }).catch(err => {
              console.log('Cannot save clients' + err.message)
            })
          }
        }
      })
      .catch(err => {
        console.log("Something wrong with DB" + err.message)
      })
}

async function clientLangs() {
  let clients = await Clients.find().populate('industry');
  let service = await Services.findOne({title: "Translation"})
          .populate('languageCombinations.source')
          .populate('languageCombinations.target');

  let randomRates = [0.1, 0.12, 0.15];
  let combs = service.languageCombinations;

  for(let client of clients) {
    if(!client.languageCombinations.length  && !client._id) {
      let industry = {industry: client.industry[0]._id, active: true};
        for(let i = 0; i < 5; i++) {
          industry.rate = randomRates[Math.floor(Math.random()*3)];
          client.languageCombinations.push({
            source: combs[i].source._id,
            target: combs[i].target._id,
            service: service._id,
            industry: industry,
          })
        }
      await Clients.updateOne({name: client.name}, client)
    } 
  }
}

function vendors() {
  return Vendors.find({})
  .then(async vendors => {
    if(!vendors.length) {
      for(let vendor of vendorsDefault) {
        const industries = await Industries.find({});
        const language = await Languages.findOne({"lang": vendor.native});
        vendor.native = language._id;
        for(let industry of industries) {
          for(let ind in vendor.industry) {
            if(industry.name == vendor.industry[ind].name) {
              vendor.industry[ind] = industry._id;
            }
          }
        }
        await new Vendors(vendor).save().then(res => {
          console.log(`Vendor ${vendor.firstName} saved!`)
        }).catch(err => {
          console.log('Cannot save vendors' + err.message)
        })
      }
    }
  })
  .catch(err => {
    console.log("Something wrong with DB" + err.message)
  })
}

async function vendorLangs() {
  let vendors = await Vendors.find().populate('industry');
  let service = await Services.findOne({title: "Translation"})
        .populate('languageCombinations.source')
        .populate('languageCombinations.target');
  let combs = service.languageCombinations;
  for(let vendor of vendors) {
    let random = Math.round(Math.random()*50);
    if(!vendor.languageCombinations.length && !vendor._id) {
      let industries = {industry: vendor.industry[0]._id, rate: 0.04, active: true};
      for(let i = random; i < random + 5; i++) {
        vendor.languageCombinations.push({
          source: combs[i].source._id,
          target: combs[i].target._id,
          service: service._id,
          industry: industries,
        })
      }
      await Vendors.update({"_id": vendor._id}, vendor);
    }
  }
}

function languages() {
  return Languages.find({})
    .then(async languages => {
      if (!languages.length) {
        for (const lang of languagesDefault) {
          await new Languages(lang).save().then((lang) => {

            }).catch((err) => {
                console.log(`Lang: ${lang.lang} wasn't save. Because of ${err.message}`)
              });
          }
          console.log('Langs are saved!');
      }
    }).catch(err => {
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
  return Projects.find({})
    .then( async (projects) => {
      if (!projects.length) {
        for (const proj of projectsDefault) {
          var languages = await Languages.find({});
          var customer = await Clients.find({}).populate('industry');
          proj.customer = customer[0]._id;
          for(let lang of languages) {
            var language = JSON.stringify(lang);
            if(lang.lang == proj.sourceLanguage.lang) {
              proj.sourceLanguage = JSON.parse(language);
            }
            for(let ind in proj.targetLanguages) {
              if(lang.lang == proj.targetLanguages[ind].lang) {
                proj.targetLanguages[ind] = JSON.parse(language);
                console.log(proj.targetLanguages[ind]);
              }
            }
          }
          await new Projects(proj).save()
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
        for(let user of usersDefault) {
          new User(user).save().
          then(result => {
            console.log(`User ${result.username} saved!`)
          })
          .catch((err) => {
            console.log(`User cannot be saved. Because of ${err.message}`)
          });
        }
      }
    }).catch(err => {
    console.log("Error on getting Users" + err.message)
  })
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
  let languages = await Languages.find({});
  let services = await Services.find({"languageForm": "Mono"});
  let industries = await Industries.find({});
  let rate = 0.12;
  for(let serv of services) {
    if(serv.title == 'Blogging') {
      rate = 0.1;
    }
    if(serv.title == 'SEO Writing') {
      rate = 0.15
    }
    const addIndustries = industries.map(item => {
      return {industry: item._id, rate: rate, package: 200, active: true}
    })
    if(!serv.languageCombinations.length) {
      for(let lang of languages) {
        if(serv.languages[0].target.indexOf(lang.symbol) != -1) { 
          serv.languageCombinations.push({
            target: lang._id,
            industries: addIndustries
          })
        }
      }
      await Services.updateOne({"title": serv.title}, serv);
    }
  }
}

async function serviceDuoLangs() {
  let languages = await Languages.find({});
  let services = await Services.find({"languageForm": "Duo"});
  let industries = await Industries.find({});
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
    const addIndustries = industries.map(item => {
      return {industry: item._id, rate: rate, active: true}
    })
    if(!serv.languageCombinations.length) {
    for(let lang of languages) {
      if(serv.languages[0].target.indexOf(lang.symbol) != -1 && lang.lang.indexOf('English') == -1) {
        serv.languageCombinations.push({
          source: englishLang._id,
          target: lang._id,
          industries: addIndustries
        })
      }
      if(serv.languages[0].source.indexOf(lang.symbol) != -1 && lang.lang.indexOf('English') == -1) {
        serv.languageCombinations.push({
          source: lang._id,
          target: englishLang._id,
          industries: addIndustries
        })
      }
    }
    await Services.update({"title": serv.title}, serv);
    }
  }  
}

async function fillDuoServiceRates() {
  const existedRates = await Duorate.find({});
  try {
    if(!existedRates.length) {
      const services = await Services.find({"languageForm": "Duo"});
      const translation = await Services.findOne({"symbol": "tr"});
      const duoServices = services.reduce((init, cur) => {
        let rate = 0;
        if(cur.symbol === "tr") rate = 0.08;
        if(cur.symbol === "pr") rate = 0.017;
        if(cur.symbol === "qt") rate = 0.028;
        const key = cur._id;
        init[key] = {value: rate, active: true};
        return {...init}
      }, {});
      const combs = translation.languageCombinations;
      for(let comb of combs) {
        const industries = comb.industries.map(item => {
          return { industry: item.industry, rates: {...duoServices}}
        })
        await Duorate.create({
          source: comb.source,
          target: comb.target,
          industries
        })
      }
    }
  } catch(err) {
    console.log(err);
  }
}

async function fillMonoServiceRates() {
  const existedRates = await Monorate.find({});
  try {
    if(!existedRates.length) {
      const services = await Services.find({"languageForm": "Mono"});
      const copywriting = await Services.findOne({"symbol": "co"});
      const monoServices = services.reduce((init, cur) => {
        let rate = 0;
        if(cur.symbol === "co") rate = 0.1; 
        if(cur.symbol === "bl") rate = 0.11;
        if(cur.symbol === "sw") rate = 0.12;
        const key = cur._id;
        init[key] = {value: rate, package: 200, active: true};
        return {...init}
      }, {});
      const combs = copywriting.languageCombinations;
      for(let comb of combs) {
        const industries = comb.industries.map(item => {
          return { industry: item.industry, rates: {...monoServices}}
        })
        await Monorate.create({
          target: comb.target,
          industries
        })
      }
    }
  } catch(err) {
    console.log(err);
  }
}

async function checkCollections() {
  await fillLeadSources();
  await timeZones();
  await languages();
  await industries();
  await services();
  await clients();
  await vendors();
  await requests();
  await projects();
  await users();
  await serviceMonoLangs();
  await serviceDuoLangs();
  await clientLangs();
  await vendorLangs();
  await fillDuoServiceRates();
  await fillMonoServiceRates()
}

module.exports = checkCollections();
