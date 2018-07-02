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

router.get('/taskDetail', async (req, res) => {
  console.log("In task details");
  let array = req.query.info;
  var file = fs.createWriteStream('./dist/taskdetail.xls');
  file.on('error', (err) => { console.log(err) });
  array.forEach( (el) => {
    file.write( el + "\r\n");
  });
  file.end();
  file.on('finish', () => {
    var taskfile = "./dist/taskdetail.xls";
    res.download(taskfile);
  })
})

router.get('/wordcount', async (req, res) => {
  
   var link = req.query.web;
      if (link.indexOf('dropbox') >= 0) {
        var firstPart = link.split("=")[0];
        link = firstPart + "=1";
      }
      const resFull = await axios({
        url: link,
        method: 'GET',
        responseType: 'blob', // important
      });

      // var file = fs.createWriteStream("./dist/english_buisness_message.txt");
      // var request = axios.get("https://www.dropbox.com/s/dr1cit55idwi1m0/english_buisness_message.txt?dl=1", function(response) {
      // response.pipe(file);
      // });
      var wstream = await reqq(link).pipe(fs.createWriteStream('./dist/testtest.txt'));
      wstream.write(resFull.data);
      wstream.end(() => { 
        unirest.post('https://pangea.s.xtrf.eu/qrf/file')
        .headers({'Content-Type': 'multipart/form-data'})      
        .attach('file', './dist/testtest.txt') // Attachment
        .end(function (response) {
        var token = response.body.token;
        fs.unlink('./dist/testtest.txt', (err) => {
          if (err) throw err;
          console.log("testtеst.txt was deleted!")
        });
        console.log('done');
        res.send({token});    
        });  
      });
});


router.post('/request', upload.fields([{ name: 'detailFiles'}, { name: 'refFiles'}]), async (req, res) => {

  const request = new Requests(req.body);
  var projectName = "";
  if (request.projectName) {
    projectName = request.projectName;
  }

  if (req.body.genBrief) {
    var obj = JSON.parse(req.body.genBrief);
    await writeFile(`./dist/reqfiles/${request.id}/written.txt`, `Package: ${obj.package}
     \nDescription: ${obj.briefDescr};
     \nTargeted Audience: ${obj.briefAudience}; 
     \nTitle: ${obj.briefTitle}; 
     \nTopics: ${obj.briefTopics};
     \nCovered points: ${obj.briefSure};
     \nExamples: ${obj.briefExample}; 
     \nStructure: ${JSON.stringify(obj.structure)};
     \nStyle: ${obj.style}
     \nTone of Voice: ${JSON.stringify(obj.tone)}
     \nDesign: ${JSON.stringify(obj.design)}
     \nSeo: ${JSON.stringify(obj.seo)}
     \nCTA: ${obj.cta}`)
    .then(() => {
      console.log('file been written');
      
    }).catch(err => console.log(err));
  }

  const detailFiles = req.files["detailFiles"];
  const refFiles = req.files["refFiles"];

  request.sourceLanguage = JSON.parse(req.body.sourceLanguage);
  request.targetLanguages = JSON.parse(req.body.targetLanguages);
  request.service = JSON.parse(req.body.service);
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
    if (projectName) {
      sendMailPortal(request);
      quote(request);
    } else {
      sendMail(request);    
    }
    sendMailClient(request);
    // quote(request);

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
  var projectName = "";
  if (request.projectName) {
    projectName = request.projectName;
  }

  if (req.body.genBrief) {
    var obj = JSON.parse(req.body.genBrief);
    await writeFile(`./dist/reqfiles/${request.id}/written.txt`, `Package: ${obj.package}
     \nDescription: ${obj.briefDescr};
     \nTargeted Audience: ${obj.briefAudience}; 
     \nTitle: ${obj.briefTitle}; 
     \nTopics: ${obj.briefTopics};
     \nExamples: ${obj.briefExample}; 
     \nStructure: ${JSON.stringify(obj.structure)};
     \nStyle: ${obj.style}
     \nTone of Voice: ${JSON.stringify(obj.tone)}
     \nDesign: ${JSON.stringify(obj.design)}
     \nSeo: ${JSON.stringify(obj.seo)}
     \nCTA: ${obj.cta}`)
    .then(() => {
      console.log('file been written');
      
    }).catch(err => console.log(err));
  }

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
    if (projectName) {
      sendMailPortal(request)
    } else {
      sendMail(request);    
    }
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

router.get('/industries', (req, res) => {
  Industries.find().then(results => {
    res.send(results)
  }).catch(err => {
    console.log(err);
    res.statusCode(500);
    res.send('Something wrong with DB');
  });
});

module.exports = router;