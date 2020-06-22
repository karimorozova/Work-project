const {
  Languages,
  Requests,
  Projects,
  User,
  Services,
  Industries,
  Pricelist,
  Timezones,
  LeadSource,
  Group,
  Step,
  Package,
  Clients,
  Vendors,
  Instruction,
  CancelReason,
  DiscountChart,
  TierLqa,
  Units,
  CurrencyRatio,
  StepMultiplier,
  IndustryMultiplier
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
  discountChartsDefault,
  tierLqasDefault,
  unitsDefault,
} = require('./dbDefaultValue');
const ObjectId = require('mongodb').ObjectID;
const { Converter } = require('easy-currencies');

async function fillTierLqa() {
  try {
    const tierLqas = await TierLqa.find();
    if (!tierLqas.length) {
      await TierLqa.create(tierLqasDefault);
    }
  } catch (err) {
    console.log("Error on filling default Tier Lqas");
    console.log(err);
  }
}

async function fillPackages() {
  try {
    const packages = await Package.find();
    if (!packages.length) {
      for (let package of packagesDefault) {
        await new Package(package).save();
      }
    }
  } catch (err) {
    console.log("Error on filling default Packages");
    console.log(err);
  }
}

async function fillInstructions() {
  try {
    const instructions = await Instruction.find();
    if (!instructions.length) {
      for (let instruction of instructionsDefault) {
        await new Instruction(instruction).save();
      }
    }
  } catch (err) {
    console.log("Error on filling default Instructions");
    console.log(err);
  }
}

async function fillCancelReasons() {
  try {
    const cancelReasons = await CancelReason.find();
    if (!cancelReasons.length) {
      for (let cancelReason of cancelReasonsDefault) {
        await new CancelReason(cancelReason).save();
      }
    }
  } catch (err) {
    console.log("Error on filling default Cancel Reasons");
    console.log(err);
  }
}

async function fillDiscountCharts() {
  try {
    const discountCharts = await DiscountChart.find();
    if (!discountCharts.length) {
      for (let chart of discountChartsDefault) {
        await new DiscountChart(chart).save();
      }
    }
  } catch (err) {
    console.log("Error on filling default Discount Charts");
    console.log(err);
  }
}

function fillLeadSources() {
  return LeadSource.find({})
    .then(async sources => {
      if (!sources.length) {
        for (const source of leadSourcesDefault) {
          await new LeadSource({ source }).save().then((res) => {

          }).catch(err => {
            console.log(`Leadsource ${source} hasn't been saved because of ${err.message}`);
          });
        }
        console.log('Leadsources are saved!');
      }
    })
    .catch(err => {
      console.log('Something is wrong' + err);
    });
}

function fillGroups() {
  return Group.find({})
    .then(async groups => {
      if (!groups.length) {
        for (const group of groupsDefault) {
          await new Group({ name: group }).save().then((res) => {

          }).catch(err => {
            console.log(`Group ${group} hasn't been saved because of ${err.message}`);
          });
        }
        console.log('Groups are saved!');
      }
    })
    .catch(err => {
      console.log('Something is wrong ' + err);
    });
}

function fillSteps() {
  return Step.find({})
    .then(async steps => {
      if (!steps.length) {
        for (const step of stepsDefault) {
          let calculationUnit;
          const { title } = step;
          switch (title) {
            default:
            case 'Translation':
              calculationUnit = await Units.findOne({ type: 'CAT Wordcount' });
              break;
            case 'Revising':
              calculationUnit = await Units.findOne({ type: 'CAT Wordcount' });
              break;
            case 'Editing':
              calculationUnit = await Units.findOne({ type: 'CAT Wordcount' });
              break;
            case 'QA':
              calculationUnit = await Units.findOne({ type: 'Hours' });
              break;
            case 'Graphic Design':
              calculationUnit = await Units.findOne({ type: 'Hours' });
              break;
            case 'Copywriting':
              calculationUnit = await Units.findOne({ type: 'Packages' });
              break;
            case 'Proofreading':
              calculationUnit = await Units.findOne({ type: 'Packages' });
              break;
          }
          await new Step({ ...step, calculationUnit }).save().then((res) => {

          }).catch(err => {
            console.log(`Step ${step} hasn't been saved because of ${err.message}`);
          });
        }
        console.log('Steps are saved!');
      }
    })
    .catch(err => {
      console.log('Something is wrong ' + err);
    });
}

function timeZones() {
  return Timezones.find({})
    .then(async timezones => {
      if (!timezones.length) {
        for (const time of timezonesDefault) {
          await new Timezones({ zone: time }).save().then((res) => {

          }).catch(err => {
            console.log(`Timezone ${time} hasn't been saved because of ${err.message}`);
          });
        }
        console.log('Timezones are saved!');
      }
    })
    .catch(err => {
      console.log('Something is wrong' + err);
    });
}

function clients() {
  return Clients.find({})
    .then(async clients => {
      if (!clients.length) {
        for (const client of clientsDefault) {
          let industries = await Industries.find({});
          for (let industry of industries) {
            for (let ind in client.industries) {
              if (industry.name == client.industries[ind].name) {
                client.industries[ind] = industry._id;
              }
            }
          }
          await new Clients(client).save().then(res => {
            console.log(`Client ${client.name} saved!`);
          }).catch(err => {
            console.log('Cannot save clients' + err.message);
          });
        }
      }
    })
    .catch(err => {
      console.log("Something wrong with DB" + err.message);
    });
}

function isDefaultValue(entity) {
  return entity.name ? entity.name.indexOf('default') !== -1 : entity.firstName.indexOf('default') !== -1;
}

async function fillClientsRates() {
  try {
    let clients = await Clients.find().populate('industries');
    for (let client of clients) {
      const combinations = [...client.monoRates, ...client.wordsRates, ...client.hoursRates];
      if (!combinations.length && isDefaultValue(client)) {
        const { monoRates, wordsRates, hoursRates } = await getRates(client.industries);
        await Clients.updateOne({ name: client.name }, { monoRates, wordsRates, hoursRates });
      }
    }
  } catch (err) {
    console.log(err);
    console.log("Error on filling clients language combinations");
  }
}

function vendors() {
  return Vendors.find({})
    .then(async vendors => {
      if (!vendors.length) {
        for (let vendor of vendorsDefault) {
          const industries = await Industries.find({});
          const language = await Languages.findOne({ "lang": vendor.native });
          vendor.native = language._id;
          for (let industry of industries) {
            for (let ind in vendor.industries) {
              if (industry.name == vendor.industries[ind].name) {
                vendor.industries[ind] = industry._id;
              }
            }
          }
          await new Vendors(vendor).save().then(res => {
            console.log(`Vendor ${vendor.firstName} saved!`);
          }).catch(err => {
            console.log('Cannot save vendors' + err.message);
          });
        }
      }
    })
    .catch(err => {
      console.log("Something wrong with DB" + err.message);
    });
}

async function fillVendorsRates() {
  try {
    let vendors = await Vendors.find().populate('industries');
    for (let vendor of vendors) {
      const combinations = [...vendor.monoRates, ...vendor.wordsRates, ...vendor.hoursRates];
      if (!combinations.length && isDefaultValue(vendor)) {
        const { monoRates, wordsRates, hoursRates } = await getRates(vendor.industries);
        await Vendors.updateOne({ firstName: vendor.firstName }, { monoRates, wordsRates, hoursRates });
      }
    }
  } catch (err) {
    console.log(err);
    console.log("Error on filling clients language combinations");
  }
}

function languages() {
  return Languages.find({})
    .then(async languages => {
      if (!languages.length) {
        for (const lang of languagesDefault) {
          await new Languages(lang).save().then((lang) => {

          }).catch((err) => {
            console.log(`Lang: ${lang.lang} wasn't save. Because of ${err.message}`);
          });
        }
        console.log('Langs are saved!');
      }
    }).catch(err => {
      console.log(err);
    });
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
              console.log(`Request: with name ${req.contactName} wasn't save. Because of ${err.message}`);
            });
        }

      }
    })
    .catch(err => {
      console.log(err);
    });
}

function projects() {
  return Projects.find({})
    .then(async (projects) => {
      if (!projects.length) {
        for (const proj of projectsDefault) {
          var languages = await Languages.find({});
          var customer = await Clients.find({}).populate('industry');
          proj.customer = customer[0]._id;
          for (let lang of languages) {
            var language = JSON.stringify(lang);
            if (lang.lang == proj.sourceLanguage.lang) {
              proj.sourceLanguage = JSON.parse(language);
            }
            for (let ind in proj.targetLanguages) {
              if (lang.lang == proj.targetLanguages[ind].lang) {
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
              console.log(`Project: with id ${proj.projectId} wasn't save. Because of ${err.message}`);
            });
        }
      }
    })
    .catch(err => {
      console.log(err);
    });
}

function users() {
  User.find({})
    .then(async (users) => {
      if (!users.length) {
        for (let user of usersDefault) {
          const group = await Group.findOne({ name: user.group });
          user.group = group.id;
          new User(user).save().then(result => {
            console.log(`User ${result.username} saved!`);
          })
            .catch((err) => {
              console.log(`User cannot be saved. Because of ${err.message}`);
            });
        }
      }
    }).catch(err => {
    console.log("Error on getting Users" + err.message);
  });
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
              console.log(`Service ${service.title} was saved!`);
            })
            .catch((err) => {
              console.log(`Service ${service.title} wasn't saved. Because of ${err.message}`);
            });
        }
      }
    })
    .catch(err => {
      console.log(err);
    });
}

async function getRates(industries) {
  try {
    const languages = await Languages.find().limit(10);
    const englishLang = await Languages.findOne({ symbol: "EN-GB" });
    const wordsSteps = await Step.find({ calculationUnit: "Words" });
    const hoursSteps = await Step.find({ calculationUnit: "Hours" });
    const monoSteps = await Step.find({ calculationUnit: "Packages" });
    const wordsRates = getDuoCombinations({ languages, englishLang, industries, steps: wordsSteps });
    const hoursRates = getDuoCombinations({ languages, englishLang, industries, steps: hoursSteps });
    const monoRates = getMonoCombinations({ languages, industries, steps: monoSteps });
    return { wordsRates, hoursRates, monoRates };
  } catch (err) {
    console.log(err);
  }
}

function getDuoCombinations({ languages, englishLang, industries, steps }) {
  const rates = steps.reduce((prev, cur) => {
    prev[cur.id] = { value: 0.08, min: 10, active: true };
    return prev;
  }, {});
  let combinations = [];
  for (let lang of languages) {
    combinations.push({
      source: englishLang.id,
      target: lang.id,
      industries,
      rates
    });
  }
  return combinations;
}

function getMonoCombinations({ languages, industries, steps }) {
  const rates = steps.reduce((prev, cur) => {
    prev[cur.id] = { value: 0.1, min: 5, active: true };
    return prev;
  }, {});
  let combinations = [];
  for (let lang of languages) {
    combinations.push({
      packageSize: 200,
      target: lang.id,
      industries,
      rates
    });
  }
  return combinations;
}

async function fillPricelist() {
  try {
    const industries = await Industries.find();
    const { wordsRates, hoursRates, monoRates } = await getRates(industries);
    let pricelists = await Pricelist.find();
    if (!pricelists.length) {
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
  } catch (err) {
    console.log(err);
    console.log("Error in fillPricelist");
  }
}

async function fillUnits() {
  try {
    const units = await Units.find();
    if (!units.length) {
      for (let unit of unitsDefault) {
        await new Units(unit).save();
      }
    }
  } catch (err) {
    console.log("Error on filling default Units");
    console.log(err);
  }
}

async function fillUnitSteps() {
  const units = await Units.find();
  if (!units[0].steps.length) {
    try {
      for (let unit of units) {
        const { type } = unit;
        switch (type) {
          default:
          case 'Cat Wordcount':
            unit.steps = await Step.find({ $or: [{ title: 'Translation' }, { title: 'Revising' }, { title: 'Editing' }] });
            break;
          case 'Hours':
            unit.steps = await Step.find({ $or: [{ title: 'QA' }, { title: 'Graphic Design' }] });
            break;
          case 'Packages':
            unit.steps = await Step.find({ $or: [{ title: 'Copywriting' }, { title: 'Proofreading' }] });
            break;
        }
        await Units.updateOne({ _id: ObjectId(unit._id) }, unit, { upsert: true });
      }
      console.log('Units are saved!');
    } catch (err) {
      console.log(err);
      console.log('Error on fillUnitSteps');
    }
  }
}

async function fillCurrencyRatio() {
  try {
    const converter = new Converter();
    const currencyRatios = await CurrencyRatio.find();
    if (!currencyRatios.length) {
      const usdRatio = await converter.convert(1, 'EUR', 'USD');
      const gbpRatio = await converter.convert(1, 'EUR', 'GBP');
      await CurrencyRatio.create({
        USD: usdRatio.toFixed(2),
        GBP: gbpRatio.toFixed(2),
      });
      console.log('Currency ratios are saved!');
    }
  } catch (err) {
    console.log(err);
    console.log('Error on filling currency ratios');
  }
}

async function fillStepMultipliers() {
  try {
    const stepMultipliers = await StepMultiplier.find();
    if (!stepMultipliers.length) {
      const units = await Units.find({ active: true });
      const combinations = [];
      for (let { _id, sizes, steps } of units) {
        if (sizes.length) {
          sizes.forEach(size => {
            steps.forEach(step => {
              combinations.push({
                step: step._id,
                unit: _id.toString(),
                size: +size,
              })
            })
          })
        } else {
          steps.forEach(step => combinations.push({
            step: step._id,
            unit: _id.toString(),
            size: 1
          }))
        }
      }
      for (let combination of combinations) {
        await StepMultiplier.create(combination)
      }
      console.log('Step multipliers are saved!');
    }
  } catch (err) {
    console.log(err);
    console.log('Error on filling step multipliers');
  }
}

async function fillIndustryMultipliers() {
  try {
    const industryMultipliers = await IndustryMultiplier.find();
    if (!industryMultipliers.length) {
      const industries = await Industries.find({ active: true });
      for (let { _id } of industries) {
        await IndustryMultiplier.create({
          industry: _id.toString()
        })
      }
      console.log('Industry multipliers are saved!');
    }
  } catch (err) {
    console.log(err);
    console.log('Error on filling industry multipliers');
  }
}

async function checkCollections() {
  await fillTierLqa();
  await fillPackages();
  await fillInstructions();
  await fillCancelReasons();
  await fillDiscountCharts();
  await fillLeadSources();
  await fillGroups();
  await fillUnits();
  await fillSteps();
  await fillUnitSteps();
  await timeZones();
  await languages();
  await industries();
  await services();
  await clients();
  await vendors();
  await requests();
  await projects();
  await users();
  await fillPricelist();
  await fillClientsRates();
  await fillVendorsRates();
  await fillCurrencyRatio();
  await fillStepMultipliers();
  await fillIndustryMultipliers();
}

module.exports = checkCollections();
