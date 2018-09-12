const router = require('express').Router();
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const unirest = require('unirest');
const querystring = require('querystring');
const HomeApi = require('../models/xtrf/home');
const ClientApi = require('../models/xtrf/client');
const fs = require('fs');
const mv = require('mv');
const { sendMail } = require('../utils/mailhandler');
const { sendMailClient } = require('../utils/mailhandlerclient');
const { sendMailPortal } = require('../utils/mailhandlerportal')
const { Requests, Projects, Languages, Services, Industries, Timezones } = require('../models');
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


function moveFile(oldFile, requestId) {

  var newFile = './dist/reqfiles/' + requestId + '/' + oldFile.filename;

  mv(oldFile.path, newFile, {
    mkdirp: true
  }, function (err) {
  });

  return oldFile.filename;
}

function moveLangIcon(oldFile, date) {
  var newFile = './dist/static/flags31x21pix/' + date + '-' + oldFile.filename;
  mv(oldFile.path, newFile, {
    mkdirp: true
  }, function (err) {
    if(err) {
      console.log(err);
    }
  });
  console.log('Flag icon moved!')
}

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
  var wstream = await reqq(link).pipe(fs.createWriteStream('./dist/testtest.txt'));
  wstream.write(resFull.data);
  wstream.end(() => {
    unirest.post('https://pangea.s.xtrf.eu/qrf/file')
      .headers({ 'Content-Type': 'multipart/form-data' })
      .attach('file', './dist/testtest.txt') // Attachment
      .end(function (response) {
        var token = response.body.token;
        fs.unlink('./dist/testtest.txt', (err) => {
          if (err) throw err;
          console.log("testtеst.txt was deleted!")
        });
        console.log('done');
        res.send({ token });
      });
  });
});


router.post('/request', upload.fields([{ name: 'detailFiles' }, { name: 'refFiles' }]), async (req, res) => {

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
    if (detailFiles) {
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

router.post('/project-request', upload.fields([{ name: 'detailFiles' }, { name: 'refFiles' }]), async (req, res) => {

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
    if (detailFiles) {
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

router.get('/allprojects', (req, res) => {
  Projects.find()
    .then(result => {
      res.send(result)
    })
    .catch(err => {
      console.log(err);
      res.statusCode(500);
      res.send('Something wrong with DB!')
    })
})

router.get('/languages', (req, res) => {
  Languages.find()
    .then(results => {
      res.send(results)
    })
    .catch(err => {
      console.log(err)
      res.statusCode(500);
      res.send('Something wrong with DB')
    })
});

router.get('/services', async (req, res) => {
  try {
  let allLangs = await Languages.find();  
  let services = await Services.find();

  for(let serv of services) {
    for(let combination of serv.languageCombinations) {
      for(let lang of allLangs) {
        if(serv.languageForm == 'Duo') {
          if(combination.source._id === lang._id) {
            combination.source.lang = lang.lang;
            combination.source.icon = lang.icon;
            combination.source.active = lang.active;
          }
        }
        if(combination.target._id === lang._id) {
          combination.target.lang = lang.lang;
          combination.target.icon = lang.icon;
          combination.target.active = lang.active;
        }
      }
    }
    await Services.update({title: serv.title}, serv)
  }
    res.send(services);
  } catch(err) {
      console.log(err)
      res.send('Something wrong with DB')
  }
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

router.get('/timezones', (req, res) => {
  Timezones.find()
    .then(timezones => {
        res.send(timezones)
    })
    .catch(err => {
        console.log(err)
    })
})

router.get('/customers', async (req, res) => {
  let customers = await HomeApi.getAllCustomers();
  res.send(customers)
})

router.get('/person', async (req, res) => {
  let person = await HomeApi.getPerson(req.query.customerId);
  let email = {'email': person};
  res.send(email);
})

router.post('/get-token', async (req, res) => {
  let email = {'email': req.body.email};
  try {
    let token = await HomeApi.getTokenCircular(email);
    res.send(token);
  } catch (err) {
    res.send(err);
    console.log(err);
  }
})

router.post('/token-session', async (req, res) => {
  try {
    let sessionId = await ClientApi.login(req.body.token.body);
      res.send(sessionId);
  } catch(err) {
    res.send(err)
  }
  
})

router.post("/savelanguages", upload.fields([{name: "flag"}]), async (req, res) => {
  const flag = req.files["flag"];
  var langID = req.body.dbIndex;
  let languageIcon = await Languages.find({'_id': langID});
  var existIcon = languageIcon[0].icon;
  let old = './dist' + languageIcon[0].icon;
  let date = new Date().getTime();
  if (flag) {
    fs.unlinkSync(old, (err) => {
      console.log('old file removed');
    });
    moveLangIcon(flag[0], date);
    existIcon = `/static/flags31x21pix/${date}-` + flag[0].filename; 
  }
  var objForUpdate = {
    lang: req.body.languageName,
    symbol: req.body.languageSymbol,
    iso1: req.body.languageIso1,
    iso2: req.body.languageIso2,
    active: req.body.languageActive,
    icon: existIcon
  };
  Languages.update({"_id": langID}, objForUpdate).then(result => {
    res.send(result);
  }).catch(err => {
    console.log(err);
    res.send('Something went wrong :(');
  });
});

router.post("/removelanguages", async(req, res) => {
  var langID = req.body.languageRem;
  Languages.deleteOne({"_id": langID})
  .then(result => {
    res.send('Removed')
  })
  .catch(err => {
    console.log(err);
    res.send('Something is wrong...')
  });
});

router.get("/startproject", (req, res) => {
  console.log(req.body)
})

module.exports = router;