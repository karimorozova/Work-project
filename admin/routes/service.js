const router = require('express').Router();
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const unirest = require('unirest');
const querystring = require('querystring');
const fs = require('fs');
const mv = require('mv');
const { sendMail } = require('../utils/mailhandler');
const { sendMailClient } = require('../utils/mailhandlerclient');
const { sendMailPortal } = require('../utils/mailhandlerportal')
const { Clients, Projects, Languages, Services, Industries } = require('../models');
const { quote, project } = require('../models/xtrf');
const reqq = require('request');
const fileType = require('file-type');
const http = require('http');
const writeFile = require('write');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './dist/uploads/')
  },
  filename: function (req, file, cb) {
    console.log(file)
    cb(null, file.originalname)
  }
});

function moveServiceIcon(oldFile, date) {
  var newFile = './dist/static/services/' + date + '-' + oldFile.filename
  mv(oldFile.path, newFile, {
    mkdirp: true
  }, function (err) {
    if(err) {
      console.log(err);
    }
  });
  console.log('Flag icon moved!')
}

var uploadServices = multer({
  storage: storage
});

router.post("/saveservices", uploadServices.fields([{name: "uploadedFileIcon"}]), async (req, res) => {
  var serviceID = req.body.dbIndex;
  var serviceIcon = req.files["uploadedFileIcon"];
  var iconPath = "";
  let date = new Date().getTime();
  if (serviceIcon) {
    moveServiceIcon(serviceIcon[0], date);
    iconPath = `/static/services/${date}-` + serviceIcon[0].filename;
  }

  var objForUpdate = {
    active: req.body.activeFormValue,
    languageForm: req.body.languageFormValue,
    calculationUnit: req.body.calcFormValue
  };
  
  var nameVal = req.body.nameTitle;
  
  if (nameVal.length) {
    objForUpdate.title = nameVal;
  }

  if(iconPath.length) {
    objForUpdate.icon = iconPath;
  }

  Services.update({ "_id": serviceID }, objForUpdate).then(result => {
    res.send('Service updated')
  }).catch(err => {
    console.log(err);
    res.send('Something wrong...')
  });
});

router.post("/removeservices", async (req, res) => {
  var serviceID = req.body.serviceRem;
  Services.deleteOne({ "_id": serviceID })
    .then(result => {
      res.send('Removed');
    })
    .catch(err => {
      console.log(err);
    });
});

router.post('/jobcost', async (req, res) => {
  var project = req.body;
  var jobs = req.body.jobs;
  var service = project.service;

  let result = await Services.find({'title': service});
  var rates = result[0].languageCombinations;
      for(let i = 0; i < jobs.length; i++) {
        for(let j = 0; j < rates.length; j++) {
          if(jobs[i].sourceLanguage == rates[j].source.lang &&
            jobs[i].targetLanguage == rates[j].target.lang ) {
              for(let elem of rates[j].industries) {
                if(project.industry == elem.name) {
                  jobs[i].cost = parseFloat((+jobs[i].wordcount * +elem.rate).toFixed(2));
                }
                // if(project.industry == 'General' && elem.name == 'All') {
                //   jobs[i].cost = +jobs[i].wordcount * +elem.rate;
                // }
              }
          }
        }
      }  
  const totalCost = jobs.reduce((init, cur) => {
    return init + cur.cost;
  }, 0)
  Projects.update({"_id": project._id}, {$set: {'jobs': jobs, 'totalCost': totalCost}})
  .then(result => {
    res.send(result);
  });
})

router.post('/rates-mono', async (req, res) => {
  var rate = await req.body;
  let industries = await Industries.find();
  let service = await Services.find({'title': rate.title});

  for(let indus of rate.industry) {
    for(let industry of industries) {
      if(industry.name == indus.name) {
        industry.rate = indus.rate;
        industry.active = indus.active;
      } else {
        industry.active = false;
      }
    }
  }

  var exist = false;

  rates = service[0].languageCombinations;
  
  for(let j = 0; j < rate.industry.length; j++) {
    for(let i = 0; i < rates.length; i++) {
      if(rate.targetLanguage.lang == rates[i].target.lang) {
        exist = true;
        rates[i].package = rate.package;
        for(let elem of rates[i].industries) {
          if(rate.industry[j].name == elem.name || rate.industry[j].name == 'All') {
            elem.rate = rate.industry[j].rate;
            elem.active = rate.industry[j].active;
          }
        }
      }
    }
    if(exist) {
      break;
    }
  }
  if(exist) {
    let result = await Services.update({'title': rate.title}, {'languageCombinations': rates});
    res.send(result);
  } else {
    rates.push({
      source: null,
      target: rate.targetLanguage,
      active: true,
      industries: industries
    });
    await Services.update({'title': rate.title}, {'languageCombinations': rates}).then(response => {
      res.send(response);
    }).catch(err => {
      console.log(err)
    })
  }

})

router.post('/delete-monorate', async (req, res) => {
  var rate = await req.body;
  if(!rate.targetLanguage || !rate.industry[0].package) {
    return true;
  }
  var rates = [];
  let service = await Services.find({'title': rate.title});
  rates = service[0].languageCombinations;
  var findRate = "";

  for(let j = 0; j < rate.industry.length; j++) {
    for(let i = 0; i < rates.length; i++) {
      if(rate.targetLanguage.lang == rates[i].target.lang) {
        for(let elem of rates[i].industries) {
          if(rate.industry[j].name == elem.name || rate.industry[j].name == 'All') {
            elem.rate = 0;
            elem.active = false;
          }
        }
        findRate = rates[i].industries.find(item => {
          if(item.rate > 0) {
            return item;
          }
        });
        if(!findRate) {
          rates.splice(i, 1);
        }
      }
    }
  }
  let result = await Services.update({'title': rate.title}, {'languageCombinations': rates});
  res.send(result);
})

router.post('/rates', async (req, res) => {
  var rate = await req.body;
  var rates = [];
  let industries = await Industries.find();
  let service = await Services.find({'title': rate.title});

  for(let indus of rate.industry) {
    for(let industry of industries) {
      if(industry.name == indus.name) {
        industry.rate = indus.rate;
        industry.active = indus.active;
      } else {
        industry.active = false;
      }
    }
  }
  
  var exist = false;

  rates = service[0].languageCombinations;
  
  for(let j = 0; j < rate.industry.length; j++) {
    for(let i = 0; i < rates.length; i++) {
      if(rate.sourceLanguage.lang == rates[i].source.lang &&
        rate.targetLanguage.lang == rates[i].target.lang) {
        exist = true;
        for(let elem of rates[i].industries) {
          if(rate.industry[j].name == elem.name || rate.industry[j].name == 'All') {
            elem.rate = rate.industry[j].rate
            elem.active = rate.industry[j].active;
          }
        }
      }
    }
    if(exist) {
      break;
    }
  }
  if(exist) {
    let result = await Services.update({'title': rate.title}, {'languageCombinations': rates});
    res.send(result);  
  } else {
    rates.push({
      source: rate.sourceLanguage,
      target: rate.targetLanguage,
      active: true,
      industries: industries
    });
    await Services.update({'title': rate.title}, {'languageCombinations': rates}).then(response => {
      res.send(response);
    }).catch(err => {
      console.log(err)
    })
  }
})

router.post('/several-langs', async (req, res) => {
  let langCombs = req.body;
  let industries = await Industries.find();
  industries = JSON.stringify(industries);
  let services = await Services.find({languageForm: "Duo"});
  for(let comb of langCombs) {
    let service = services.find(item => {
      return item.title == comb.service.title
    });
    let exist = false;
    for(let servComb of service.languageCombinations) {
      if(comb.source.lang == servComb.source.lang && comb.target.lang == servComb.target.lang) {
        for(let indus of servComb.industries) {
          for(let ind of comb.industry) {
            if(indus.name == ind.name) {
              indus.rate = ind.rate
            }
          }
        }
        exist = true;
      }
    }
    if(!exist) {
      let industry = JSON.parse(industries);
      for(let indus of industry) {
        for(let ind of comb.industry) {
          if(indus.name == ind.name) {
            indus.rate = ind.rate;
            indus.active = true;
          } else {
            indus.rate = 0;
            indus.active = false;
          }
        }
      }
      service.languageCombinations.push({
        source: comb.source,
        target: comb.target,
        industries: industry,
        active: true
      })
      let result = await Services.updateOne({"_id": service._id}, {$set: {languageCombinations: service.languageCombinations}})
    } else {
      let result = await Services.updateOne({"_id": service._id}, {$set: {languageCombinations: service.languageCombinations}})
    }
  }
  res.send('Several langs added..')
})

router.post('/delete-duorate', async (req, res) => {
  var rate = await req.body;
  if(!rate.sourceLanguage || !rate.targetLanguage) {
    return true;
  }
  var rates = [];
  let service = await Services.find({'title': rate.title});
  rates = service[0].languageCombinations;
  var findRate = "";

  for(let j = 0; j < rate.industry.length; j++) {
    for(let i = 0; i < rates.length; i++) {
      if(rate.sourceLanguage.lang == rates[i].source.lang &&
        rate.targetLanguage.lang == rates[i].target.lang) {
        for(let elem of rates[i].industries) {
          if(rate.industry[j].name == elem.name || rate.industry[j].name == 'All') {
            elem.rate = 0;
            elem.active = false;
          }
        }
        findRate = rates[i].industries.find(item => {
          if(item.rate > 0) {
            return item;
          }
        });
        if(!findRate) {
          rates.splice(i, 1);
        }
      }
    }
  }
  let result = await Services.update({'title': rate.title}, {'languageCombinations': rates});
  res.send(result);
})

router.get('/parsed-rates', async (req, res) => {
  try{
    const service = await Services.find({"title": req.query.title, "languageForm": req.query.form}).populate('languageCombinations.source').populate('languageCombinations.target');
    const rates = [];
    for(let i = 0; i < service[0].languageCombinations.length; i++) {
      for(let elem of service[0].languageCombinations[i].industries) {
        if(elem.rate > 0) {
          if(req.query.form === "Duo") {
            rates.push({
              title: service[0].title,
              sourceLanguage: service[0].languageCombinations[i].source,
              targetLanguage: service[0].languageCombinations[i].target,
              industry: [elem],
              active: true
            })
          } else {
            rates.push({
              title: service[0].title,
              targetLanguage: service[0].languageCombinations[i].target,
              industry: [elem],
              active: true
            })
          }
        }
      }
    }
    res.send(rates);
  } catch(err) {
    console.log(err);
    res.status(500).send('Something went wrong!' + err)
  }
})

module.exports = router;