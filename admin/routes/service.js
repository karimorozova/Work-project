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
    cb(null, './static/services')
  },
  filename: function (req, file, cb) {
    console.log(file)
    cb(null, file.originalname)
  }
});

var uploadServices = multer({
  storage: storage
});

router.post("/saveservices", uploadServices.single("uploadedFileIcon"), async (req, res) => {
  var langID = req.body.dbIndex;
  var iconPath = req.file.path;
  var objForUpdate = {
    icon: iconPath,
    title: req.body.nameTitle,
    active: req.body.activeFormValue,
    languageForm: req.body.languageFormValue,
    calculationUnit: req.body.calcFormValue
  };
  Services.update({"_id": langID}, objForUpdate).then(result => {
  }).catch(err => {
    console.log(err);
  });
});

router.post("/removeservices", async(req, res) => {
  var langID = req.body.serviceRem;
  Services.deleteOne({"_id": langID})
  .then(result => {
  })
  .catch(err => {
    console.log(err);
  });
});

module.exports = router;