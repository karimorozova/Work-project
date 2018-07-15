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
const { Requests, Languages, Services, Industries } = require('../models');
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

function moveIndustryIcon(oldFile, date) {
  var newFile = './dist/static/industries/' + date + '-' + oldFile.filename
  mv(oldFile.path, newFile, {
    mkdirp: true
  }, function (err) {
    if(err) {
      console.log(err);
    }
  });
  console.log('Flag icon moved!')
}

function moveExcelFile(oldFile, date) {
  var newFile = './dist/static/industries/exel/' + date + '-' + oldFile.filename
  mv(oldFile.path, newFile, {
    mkdirp: true
  }, function (err) {
    if(err) {
      console.log(err);
    }
  });
}

var uploadIndustries = multer({
  storage: storage
});

router.post("/saveindustries", uploadIndustries.fields([{ name: "uploadedFileIcon" }, { name: "uploadedFile" }]), async (req, res) => {
  var industryID = req.body.dbIndex;
  var iconsArray = req.files["uploadedFileIcon"];
  var iconPath = "";
  let date = new Date().getTime();
  if(iconsArray) {
    moveIndustryIcon(iconsArray[0], date);
    iconPath = `/static/industries/${date}-` + iconsArray[0].filename;
  }
  var genericArray = req.files["uploadedFile"];
  var genericPath = "";
  if (genericArray) {
    moveExcelFile(genericArray[0], date);
    genericPath = `/static/industries/exel/${date}` + '-' + genericArray[0].filename;    
  }
  var nameVal = req.body.nameTitle;

  var objForUpdate = {
    active: req.body.activeFormValue
  };
  if(nameVal.length ) {
    objForUpdate.name = nameVal
  }
  if(iconPath) {
    objForUpdate.icon = iconPath
  }
  if(genericPath) {
    objForUpdate.generic = genericPath
  }
  console.log(objForUpdate);
  Industries.update({ "_id": industryID }, objForUpdate).then(result => {
    res.send('done');
  }).catch(err => {
    console.log(err);
    res.send('Something wrong...')
  });
});

router.post("/removeindustries", async (req, res) => {
  var industryID = req.body.industryRem;
  Industries.deleteOne({ "_id": industryID })
    .then(result => {
      res.send('Removed');
      // console.log(result);
    })
    .catch(err => {
      console.log(err);
    });
});

module.exports = router;