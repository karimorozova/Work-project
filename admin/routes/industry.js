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
    cb(null, './static/')
  },
  filename: function (req, file, cb) {
    console.log(file)
    cb(null, file.originalname)
  }
});

var uploadIndustries = multer({
  storage: storage
});

router.post("/saveindustries", uploadIndustries.fields([{ name: "uploadedFileIcon" }, { name: "uploadedFile" }]), async (req, res) => {
  var langID = req.body.dbIndex;
  var iconsArray = [];
  var iconPath;
  if(iconsArray.length) {
    iconsArray = req.files["uploadedFileIcon"];
    iconPath = iconsArray[0].path;
  }
  var genericArray = [];
  var genericPath;
  if (genericArray.length) {
    genericArray = req.files["uploadedFile"];
    genericPath = genericArray[0].path;
  }

  var objForUpdate = {
    name: req.body.nameTitle,
    active: req.body.activeFormValue,
    icon: iconPath,
    generic: genericPath
  };
  console.log(objForUpdate);
  Industries.update({ "_id": langID }, objForUpdate).then(result => {
    // console.log(result);
  }).catch(err => {
    console.log(err);
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