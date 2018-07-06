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
    cb(null, './static/industries')
  },
  filename: function (req, file, cb) {
    console.log(file)
    cb(null, file.originalname)
  }
});

function moveExcelFile(oldFile, newPath) {

  mv(oldFile.path, newPath, function (err) {
    if(err) {
      console.log(err);
    }
  });
}

var uploadIndustries = multer({
  storage: storage
});

router.post("/saveindustries", uploadIndustries.fields([{ name: "uploadedFileIcon" }, { name: "uploadedFile" }]), async (req, res) => {
  var langID = req.body.dbIndex;
  var iconsArray = [];
  iconsArray = req.files["uploadedFileIcon"];
  var iconPath = "";
  if(iconsArray !== undefined) {
    iconPath = iconsArray[0].path;
    console.log(iconPath);
  }
  var genericArray = [];
  genericArray = req.files["uploadedFile"];
  var genericPath = "";
  var excelName = "";
  if (genericArray !== undefined) {
    genericPath = genericArray[0].path;
    excelName = genericArray[0].filename;
    moveExcelFile(genericArray[0], "static/" + excelName);
  }
  var nameVal = req.body.nameTitle;

  var objForUpdate = {
    active: req.body.activeFormValue
  };
  if(nameVal.length ) {
    objForUpdate = {
      name: nameVal,
    };
  }
  if(iconPath.length ) {
    objForUpdate = {
      icon: iconPath
    };
  }
  if(genericPath.length ) {
    objForUpdate = {
      generic: genericPath
    };
  }
  console.log(objForUpdate);
  Industries.update({ "_id": langID }, objForUpdate).then(result => {
    res.send('done');
    // console.log(result);
  }).catch(err => {
    console.log(err);
    res.send('Something wrong...')
  });
});

router.post("/removeindustries", async (req, res) => {
  var langID = req.body.industryRem;
  Industries.deleteOne({ "_id": langID })
    .then(result => {
      // console.log(result);
    })
    .catch(err => {
      console.log(err);
    });
});

module.exports = router;