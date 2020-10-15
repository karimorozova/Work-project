const ObjectId = require('mongodb').ObjectID;
const { Converter } = require('easy-currencies');
const {
  Languages,
  User,
  Services,
  Industries,
  Pricelist,
  Timezones,
  LeadSource,
  Group,
  Step,
  Clients,
  Vendors,
  Instruction,
  CancelReason,
  Units,
  CurrencyRatio,
} = require('../models');

const {
  getDefaultBasicPrices,
  getDefaultStepMultipliers,
  getDefaultIndustryMultipliers,
  defaultLanguages,
  defaultUsers,
  defaultServices,
  defaultIndustries,
  defaultTimezones,
  defaultGroups,
  defaultSteps,
  defaultClients,
  defaultVendors,
  defaultUnits,
  defaultCancelReasons,
  defaultInstructions,
  defaultLeadSources
} = require('./defaults');

async function fillInstructions() {
  try {
    const instructions = await Instruction.find();
    if (!instructions.length) {
      for (let instruction of defaultInstructions) {
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
      for (let cancelReason of defaultCancelReasons) {
        await new CancelReason(cancelReason).save();
      }
    }
  } catch (err) {
    console.log("Error on filling default Cancel Reasons");
    console.log(err);
  }
}

function fillLeadSources() {
  return LeadSource.find({})
    .then(async sources => {
      if (!sources.length) {
        for (const source of defaultLeadSources) {
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
        for (const group of defaultGroups) {
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
        for (const step of defaultSteps) {
          let unit;
          let calculationUnit;
          const { title } = step;
          switch (title) {
            default:
            case 'Translation':
            case 'Revising':
            case 'Editing':
              unit = await Units.findOne({ type: 'CAT Wordcount' });
              calculationUnit = unit._id;
              break;
            case 'QA':
            case 'Graphic Design':
              unit = await Units.findOne({ type: 'Hours' });
              calculationUnit = unit._id;
              break;
            case 'Copywriting':
            case 'Proofreading':
              unit = await Units.findOne({ type: 'Packages' });
              calculationUnit = unit._id;
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
        for (const time of defaultTimezones) {
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
        for (const client of defaultClients) {
          let { projectManager, accountManager, salesManager } = client;
          client.projectManager = ObjectId(await User.findOne({ email: projectManager })._id);
          client.accountManager = ObjectId(await User.findOne({ email: accountManager })._id);
          client.salesManager = ObjectId(await User.findOne({ email: salesManager })._id);
          const pricelists = await Pricelist.find();
          client.defaultPricelist = ObjectId(pricelists[0]._id)
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

function vendors() {
  return Vendors.find({})
    .then(async vendors => {
      if (!vendors.length) {
        for (let vendor of defaultVendors) {
          const industries = await Industries.find({});
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

function languages() {
  return Languages.find({})
    .then(async languages => {
      if (!languages.length) {
        for (const lang of defaultLanguages) {
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

function users() {
  User.find({})
    .then(async (users) => {
      if (!users.length) {
        for (let user of defaultUsers) {
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
      for (let industry of defaultIndustries) {
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
        for (const service of defaultServices) {

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


async function fillUnits() {
  try {
    const units = await Units.find();
    if (!units.length) {
      for (let unit of defaultUnits) {
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
  const isEmptyUnitsStepsId = units[0].steps.length && units[1].steps.length && units[2].steps.length;

  if (units.length && !isEmptyUnitsStepsId) {
    try {
      for (let unit of units) {
        const { type } = unit;
        switch (type) {
          case 'CAT Wordcount':
            const stepTranslation = await Step.findOne({ title: 'Translation' });
            const stepRevising = await Step.findOne({ title: 'Revising' });
            const stepEditing = await Step.findOne({ title: 'Editing' });
            unit.steps = [stepTranslation._id, stepRevising._id, stepEditing._id];
            break;
          case 'Packages':
            const stepCopywriting = await Step.findOne({ title: 'Copywriting' });
            const stepProofreading = await Step.findOne({ title: 'Proofreading' });
            unit.steps = [stepCopywriting._id, stepProofreading._id];
            break;
          default:
            const stepGraphicDesign = await Step.findOne({ title: 'Graphic Design' });
            const stepQA = await Step.findOne({ title: 'QA' });
            unit.steps = [stepGraphicDesign._id, stepQA._id];
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

async function fillPricelist() {
  try {
    const pricelists = await Pricelist.find();
    if (!pricelists.length) {
      const defaultBasicPrices = await getDefaultBasicPrices();
      const defaultStepMultipliers = await getDefaultStepMultipliers();
      const defaultIndustryMultipliers = await getDefaultIndustryMultipliers();
      await Pricelist.create({
        name: 'Default',
        isClientDefault: true,
        isVendorDefault: true,
        isActive: true,
        basicPricesTable: defaultBasicPrices,
        stepMultipliersTable: defaultStepMultipliers,
        industryMultipliersTable: defaultIndustryMultipliers,
      });
      console.log('Pricelists are saved!');
    }
  } catch (err) {
    console.log(err);
    console.log('Error on filling pricelist');
  }
}

async function checkCollections() {
  await fillInstructions();
  await fillCancelReasons();
  await fillLeadSources();
  await fillGroups();
  await users();
  await fillUnits();
  await fillSteps();
  await fillUnitSteps();
  await services();
  await timeZones();
  await languages();
  await industries();
  await fillCurrencyRatio();
  await fillPricelist();
  await clients();
  await vendors();
}

module.exports = checkCollections();
