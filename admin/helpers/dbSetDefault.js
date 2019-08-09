const {
  Languages,
  Requests,
  Projects,
  User,
  Services,
  Industries,
  Pricelist,
  Duorate,
  Monorate,
  Timezones,
  LeadSource,
  Group,
  Step,
  Package,
  Clients,
  Vendors,
  Instruction,
  CancelReason,
  DiscountChart
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
  groupsDefault,
  stepsDefault,
  packagesDefault,
  clientsDefault,
  vendorsDefault,
  instructionsDefault,
  cancelReasonsDefault,
  discountChartsDefault
} = require('./dbDefaultValue');

async function fillPackages() {
  try {
    const packages = await Package.find();
    if(!packages.length) {
      for(let package of packagesDefault) {
        await new Package(package).save();
      }
    }
  } catch(err) {
    console.log("Error on filling default Packages");
    console.log(err);
  }
}

async function fillInstructions() {
    try {
        const instructions = await Instruction.find();
        if(!instructions.length) {
            for(let instruction of instructionsDefault) {
                await new Instruction(instruction).save();
            }
        }
    } catch(err) {
        console.log("Error on filling default Instructions");
        console.log(err);
    }
}

async function fillCancelReasons() {
    try {
        const cancelReasons = await CancelReason.find();
        if(!cancelReasons.length) {
            for(let cancelReason of cancelReasonsDefault) {
                await new CancelReason(cancelReason).save();
            }
        }
    } catch(err) {
        console.log("Error on filling default Cancel Reasons");
        console.log(err);
    }
}

async function fillDiscountCharts() {
    try {
        const discountCharts = await DiscountChart.find();
        if(!discountCharts.length) {
            for(let chart of discountChartsDefault) {
                await new DiscountChart(chart).save();
            }
        }
    } catch(err) {
        console.log("Error on filling default Discount Charts");
        console.log(err);
    }
}

function fillLeadSources() {
  return LeadSource.find({})
    .then(async sources => {
      if(!sources.length) {
        for(const source of leadSourcesDefault) {
          await new LeadSource({ source }).save().then((res) => {

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

function fillGroups() {
    return Group.find({})
      .then(async groups => {
        if(!groups.length) {
          for(const group of groupsDefault) {
            await new Group({ name: group }).save().then((res) => {
  
            }).catch(err => {
              console.log(`Group ${group} hasn't been saved because of ${err.message}`)
            })
          }
          console.log('Groups are saved!')
        }
    })
    .catch(err => {
        console.log('Something is wrong ' + err)
    })
}

function fillSteps() {
    return Step.find({})
      .then(async steps => {
        if(!steps.length) {
          for(const step of stepsDefault) {
            await new Step({ ...step }).save().then((res) => {
  
            }).catch(err => {
              console.log(`Step ${step} hasn't been saved because of ${err.message}`)
            })
          }
          console.log('Steps are saved!')
        }
    })
    .catch(err => {
        console.log('Something is wrong ' + err)
    })
}

function timeZones() {
  return Timezones.find({})
    .then(async timezones => {
      if(!timezones.length) {
        for(const time of timezonesDefault) {
          await new Timezones({zone: time}).save().then((res) => {

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
              for(let ind in client.industries) {
                if(industry.name == client.industries[ind].name) {
                  client.industries[ind] = industry._id;
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

function defaultClient(client) {
  return client.name.indexOf('default') !== -1;
}

async function clientLangs() {
  try {
    let clients = await Clients.find().populate('industries');
    let duoRates = await Duorate.find().populate('industries.industry');
    let monoRates = await Monorate.find().populate('industries.industry');
    for(let client of clients) {
      if(!client.languageCombinations.length && defaultClient(client)) {
        client.languageCombinations = [];
            for(let i = 0; i < 5; i++) {
              const duoIndex = Math.floor(Math.random() * (duoRates.length - 1));
              const monoIndex = Math.floor(Math.random() * (monoRates.length - 1));
              const duoIndustries = duoRates[i].industries.filter(item => item.industry.id === client.industries[0].id);
              const monoIndustries = monoRates[monoIndex].industries.filter(item => item.industry.id === client.industries[0].id);
              client.languageCombinations.push({
                source: duoRates[duoIndex].source,
                target: duoRates[duoIndex].target,
                industries: duoIndustries
              });
              client.languageCombinations.push({
                target: monoRates[monoIndex].target,
                package: monoRates[monoIndex].package,
                industries: monoIndustries
              });
            }
          await Clients.updateOne({name: client.name}, {languageCombinations: client.languageCombinations});
        }
    }
  } catch(err) {
    console.log(err);
    console.log("Error on filling clients language combinations");
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
          for(let ind in vendor.industries) {
            if(industry.name == vendor.industries[ind].name) {
              vendor.industries[ind] = industry._id;
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

function defaultVendor(vendor) {
  return vendor.firstName.indexOf('default') !== -1;
}

async function vendorLangs() {
  try {
    let vendors = await Vendors.find().populate('industries');
    let duoRates = await Duorate.find().populate('industries.industry');
    let monoRates = await Monorate.find().populate('industries.industry');
    for(let vendor of vendors) {
      if(!vendor.languageCombinations.length && defaultVendor(vendor)) {
        vendor.languageCombinations = [];
            for(let i = 0; i < 5; i++) {
              const duoIndex = Math.floor(Math.random() * (duoRates.length - 1));
              const monoIndex = Math.floor(Math.random() * (monoRates.length - 1));
              const duoIndustries = duoRates[i].industries.filter(item => item.industry.id === vendor.industries[0].id);
              const monoIndustries = monoRates[monoIndex].industries.filter(item => item.industry.id === vendor.industries[0].id);
              vendor.languageCombinations.push({
                source: duoRates[duoIndex].source,
                target: duoRates[duoIndex].target,
                industries: duoIndustries
              });
              vendor.languageCombinations.push({
                target: monoRates[monoIndex].target,
                package: monoRates[monoIndex].package,
                industries: monoIndustries
              });
            }
          await Vendors.updateOne({name: vendor.name}, {languageCombinations: vendor.languageCombinations});
        }
    }
  } catch(err) {
    console.log(err);
    console.log("Error on filling vendors language combinations");
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

async function getRates() {
    try {
        const languages = await Languages.find().limit(10);
        const englishLang = await Languages.findOne({symbol: "EN-GB"});
        const industries = await Industries.find();
        const wordsSteps = await Step.find({calculationUnit: "Words"});
        const hoursSteps = await Step.find({calculationUnit: "Hours"});
        const monoSteps = await Step.find({calculationUnit: "Packages"});
        const wordsRates = getDuoCombinations({languages, englishLang, industries, steps: wordsSteps});
        const hoursRates = getDuoCombinations({languages, englishLang, industries, steps: hoursSteps});
        const monoRates = getMonoCombinations({languages, industries, steps: monoSteps});
        return {wordsRates, hoursRates, monoRates};
    } catch(err) {
        console.log(err);
    }
}

function getDuoCombinations({languages, englishLang, industries, steps}) {
    const rates = steps.reduce((prev, cur) => {
        prev[cur.id] = {value: 0.08, min: 10, active: true}
        return prev;
    }, {})
    let combinations = [];
    for(let lang of languages) {
        combinations.push({
            source: englishLang.id,
            target: lang.id,
            industries,
            rates
        })
    }
    return combinations;
}

function getMonoCombinations({languages, industries, steps}) {
    const rates = steps.reduce((prev, cur) => {
        prev[cur.id] = {value: 0.1, min: 5, active: true}
        return prev;
    }, {})
    let combinations = [];
    for(let lang of languages) {
        combinations.push({
            packageSize: 200,
            target: lang.id,
            industries,
            rates
        })
    }
    return combinations;
}

async function fillPricelist() {
  try {
    const { wordsRates, hoursRates, monoRates } = await getRates();
    let pricelists = await Pricelist.find();
    if(!pricelists.length) {
      await Pricelist.create({
        name: 'Basic',
        isClientDefault: true,
        isVendorDefault: true,
        isActive: true,
        monoRates,
        wordsRates,
        hoursRates
      });
    }
  } catch(err) {
    console.log(err);
    console.log("Error in fillPricelist");
  }
}

async function checkCollections() {
    await fillPackages();
    await fillInstructions();
    await fillCancelReasons();
    await fillDiscountCharts();
    await fillLeadSources();
    await fillGroups();
    await fillSteps();
    await timeZones();
    await languages();
    await industries();
    await services();
    await clients();
    await vendors();
    await requests();
    await projects();
    await users();
    // await clientLangs();
    // await vendorLangs();
    await fillPricelist();
}

module.exports = checkCollections();
