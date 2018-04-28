const router = require('express').Router();
const multer = require('multer');
const mv = require('mv');
const { sendMail } = require('../utils/mailhandler');
const { Requests } = require('../models');
const { Xtrf, SmartProject, ParseHTML } = require('../models');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './dist/uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
});

var upload = multer({
  storage: storage
});


router.get('/', (req, res) => {
  res.send("vendor");
});


// Add
router.post('/request', upload.fields([{
  name: 'detailFiles'
}, {
  name: 'refFiles'
}]), (req, res) => {
  Requests.create({
    date: req.body.date,
    contactName: req.body.contactName,
    contactEmail: req.body.contactEmail,
    web: req.body.web,
    skype: req.body.skype,
    phone: req.body.phone,
    service: JSON.parse(req.body.service),
    industry: req.body.industry,
    status: req.body.status,
    accountManager: req.body.accountManager,
    companyName: req.body.companyName,
    sourceLanguage: JSON.parse(req.body.sourceLanguage),
    targetLanguages: JSON.parse(req.body.targetLanguages),
    detailFiles: req.files["detailFiles"],
    refFiles: req.files["refFiles"] ? req.files["refFiles"] : '',
    brief: req.body.brief
  })
    .then(request => {
      for (var i = 0; i < request.detailFiles.length; i += 1) {
        var oldFile = request.detailFiles[i];
        var newFile = './dist/reqfiles/' + request.id + '/' + oldFile.filename;

        mv(oldFile.path, newFile, {
          mkdirp: true
        }, function (err) {
          console.log("New file " + request.detailFiles[i]);
        });
        request.detailFiles[i] = oldFile.filename;
      }
      sendMail(request);
      /* sending request via API */
      if (request.detailFiles.length > 0) {
        Xtrf(request).then(results => {
          console.log("request added via api");
        }).catch(err => {
          console.log(err)
        })
      }

      res.send({
        message: "request was added"
      });


    })
    .catch(err => {
      console.log(err);
      let error = new Error('Something wrong with DB');
      error.status = 504;

      return res.send(error);
    })
});

router.get('/languages', (req, res) => {
  Languages.find()
    .then(results => {
      res.send(results)
    })
    .catch(err => {
      console.log(err)
      res.statusCode(500);
      res.send('Something wrond with DB')
    })
});

router.get('/services', (req, res) => {
  Services.find()
    .then(results => {
      res.send(results)
    })
    .catch(err => {
      console.log(err)
      res.statusCode(500);
      res.send('Something wrond with DB')
    })
});

module.exports = router;