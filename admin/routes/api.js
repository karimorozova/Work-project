const router = require('express').Router();
const multer = require('multer');
const mv = require('mv');
const { sendMail } = require('../utils/mailhandler');
const { Requests, Languages, Services } = require('../models');
const { quote } = require('../models/xtrf');

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

function moveFile(oldFile, requestId){

  var newFile = './dist/reqfiles/' + requestId + '/' + oldFile.filename;

  mv(oldFile.path, newFile, {
    mkdirp: true
  }, function (err) {
  });

  return oldFile.filename;
}

router.post('/request', upload.fields([{ name: 'detailFiles'}, { name: 'refFiles'}]), async (req, res) => {

  const request = new Requests(req.body);

  const detailFiles = req.files["detailFiles"];
  const refFiles = req.files["refFiles"];

  request.sourceLanguage = JSON.parse(req.body.sourceLanguage);
  request.targetLanguages = JSON.parse(req.body.targetLanguages);
  request.service = JSON.parse(req.body.service)
  try {
    await request.save();

    for (var i = 0; i < detailFiles.length; i += 1) {
      request.detailFiles.push(moveFile(detailFiles[i], request.id));
    }
    if (refFiles) {
      for (var i = 0; i < refFiles.length; i += 1) {
        request.refFiles.push(moveFile(refFiles[i], request.id))
      }
    }
    
    await request.save();
    sendMail(request);
    quote(request);

    console.log("Saved");

  } catch (err) {
    console.log(err);
  }

  res.send({
    message: "request was added"
  });

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