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
const { Requests, Projects, Languages, Services, Industries } = require('../models');
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
  var service = JSON.parse(project.service);

  
    await Services.find({'title': service.title})
    .then(result => {
      var rates = result[0].rates;
      for(let i = 0; i < jobs.length; i++) {
        for(let j = 0; j < rates.length; j++) {
          if(jobs[i].sourceLanguage == rates[j].sourceLanguage.lang &&
            jobs[i].targetLanguage == rates[j].targetLanguage.lang && 
            (project.industry == rates[j].industry.name || rates[j].industry.name == 'All')) {
              jobs[i].cost = +jobs[i].wordcount * +rates[j].rates.value;
          }
        }
      }
    })
    .catch(err => {
      console.log('Cannot find service');
      console.log(err)
    });

  await Projects.update({projectId: project.projectId}, {'jobs': jobs})
  .then(result => {
    res.send(result)
  })
  .catch(err => {
    console.log(err);
    res.send('Something wrong');
  })
})

router.post('/rates', async (req, res) => {
  console.log('We are in the rates!!');
  var rate = req.body;
  var rates = [];
  await Services.find({title: rate.title})
  .then(result  => {
    rates = result[0].rates;
  })
  .catch(err => {
    console.log(err)
  });
  var found = 0;
  for(let i = 0; i < rates.length; i++) {
    if(rate.sourceLanguage.lang == rates[i].sourceLanguage.lang &&
      rate.targetLanguage.lang == rates[i].targetLanguage.lang &&
      rate.industry.name == rates[i].industry.name) {
        rates.splice(i, 1, rate);
        found = 1
        break;
      }
  }
  if(!found) {
    rates.push(rate);
  }

  Services.update({title: rate.rates.title}, {rates: rates})
  .then(result => {
    res.send(result)
  })
  .catch(err => {
    console.log(err)
    res.send(err)
  })
})

module.exports = router;