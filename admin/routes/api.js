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
const { Requests, Languages, Services } = require('../models');
const { quote, project } = require('../models/xtrf');


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


router.get('/wordcount', async (req, res) => {
  const fileLink = "https://portal.pangea.global/file.txt";

  const resFull = await axios({
    url: fileLink,
    method: 'GET',
    responseType: 'blob', // important
  });

 /* var wstream = fs.createWriteStream('./dist/wordcount.txt');
  wstream.write(resFull.data);
  wstream.end(function () { console.log('done'); });*/

  
  //var readStream = await fs.readFileSync('./dist/wordcount.txt');
  
  unirest.post('https://pangea.s.xtrf.eu/qrf/file')
    .headers({'Content-Type': 'multipart/form-data'})      
    .attach('file', './dist/wordcount.txt') // Attachment
    .end(function (response) {
     var token = response.body.token;


     axios.post("https://pangea.s.xtrf.eu/qrf/file/estimation", {
        filesTokens: [token]
      }, {headers : {'Content-Type' : 'application/json'}})
      .then(function (response) {
        console.log('111');
      }).catch(function (error) {
        console.log('222');
      })
     /*unirest.post('https://pangea.s.xtrf.eu/qrf/file/estimation')
     .headers({'Content-Type': 'application/json'})   
     .field('filesTokens', token)
     .end((estimateResponse) =>{
        console.log('ended esimate');
     })*/

    
  });
  res.send('bad request');
});


router.post('/request', upload.fields([{ name: 'detailFiles'}, { name: 'refFiles'}]), async (req, res) => {

  const request = new Requests(req.body);

  const detailFiles = req.files["detailFiles"];
  const refFiles = req.files["refFiles"];

  request.sourceLanguage = JSON.parse(req.body.sourceLanguage);
  request.targetLanguages = JSON.parse(req.body.targetLanguages);
  request.service = JSON.parse(req.body.service)
  try {
    await request.save();
    if(detailFiles){
      for (var i = 0; i < detailFiles.length; i += 1) {
        request.detailFiles.push(moveFile(detailFiles[i], request.id));
      }
    }
    if (refFiles) {
      for (var i = 0; i < refFiles.length; i += 1) {
        request.refFiles.push(moveFile(refFiles[i], request.id))
      }
    }
  
    await request.save();
    sendMail(request);
    sendMailClient(request);
    quote(request);

    console.log("Saved");

  } catch (err) {
    console.log(err);
  }

  res.send({
    message: "request was added"
  });

});

router.post('/project-request', upload.fields([{ name: 'detailFiles'}, { name: 'refFiles'}]), async (req, res) => {

  const request = new Requests(req.body);

  const detailFiles = req.files["detailFiles"];
  const refFiles = req.files["refFiles"];

  request.sourceLanguage = JSON.parse(req.body.sourceLanguage);
  request.targetLanguages = JSON.parse(req.body.targetLanguages);
  request.service = JSON.parse(req.body.service)
  try {
    await request.save();
    if(detailFiles){
      for (var i = 0; i < detailFiles.length; i += 1) {
        request.detailFiles.push(moveFile(detailFiles[i], request.id));
      }
    }
    if (refFiles) {
      for (var i = 0; i < refFiles.length; i += 1) {
        request.refFiles.push(moveFile(refFiles[i], request.id))
      }
    }
  
    await request.save();
    sendMail(request);
    sendMailClient(request);
    project(request);

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