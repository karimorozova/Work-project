const express = require('express');
const app = express();
const router = express.Router();
const session = require('express-session');
const path = require('path');
const { User, Languages, Requests, Services, Xtrf, SmartProject, ParseHTML } = require('../models');
const { requiresLogin } = require('../utils/middleware');
const { sendMail } = require('../utils/mailhandler');
const multer = require('multer');
const mv = require('mv');


/* wordcount section */ 


const puppeteer = require("puppeteer");
const wordCount = require("html-word-count");
const bodyParser = require("body-parser");
const Entities = require('html-entities').XmlEntities;
const entities = new Entities();
const translate = require('translate');

/* end wordcount section */


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

// Vue router
router.get('/', (req, res) => {
  res.sendFile(path.resolve() + '/dist/index.html');
});

router.get('/register', (req, res) => {
  res.sendFile(path.resolve() + '/dist/index.html');
});

router.get('/login', (req, res) => {
  res.sendFile(path.resolve() + '/dist/index.html');
});

//authentication
router.post('/register', (req, res, next) => {
  // confirm that user typed same password twice
  if (req.body.password !== req.body.passwordConf) {
    const err = new Error('Passwords do not match.');
    err.status = 400;
    res.send("passwords dont match");
    return next(err);
  }

  if (req.body.email &&
    req.body.userName &&
    req.body.password &&
    req.body.passwordConf) {

    const userData = {
      email: req.body.email,
      username: req.body.userName,
      password: req.body.password
    }

    new User(userData).save()
      .then((user) => {
        req.session.userId = user.id;
      })
      .catch(err => {
        console.log(err)
      })

  } else {
    const err = new Error('All fields required.');
    err.status = 400;
    return next(err);
  }
})

router.post('/login', (req, res, next) => {
  if (req.body.logemail && req.body.logpassword) {
    User.authenticate(req.body.logemail, req.body.logpassword, (error, user) => {
      if (error || !user) {
        var err = new Error('Wrong email or password.');
        err.status = 401;
        return next(err);
      } else {
        req.session.userId = user._id;
        console.log('Loggin in!');
        res.statusCode = 200;
        res.send('Loggin in!');
        // return res.redirect('/test');
      }
    });
  } else {
    let err = new Error('All fields required.');
    err.status = 400;
    return next(err);
  }
});

// GET /logout
router.get('/logout', (req, res, next) => {
  if (req.session) {
    // delete session object
    req.session.destroy((err) => {
      if (err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});



router.get('/requests', requiresLogin, (req, res) => {
  Requests.find()
    .then(requests => {
      res.send(requests)
    })
    .catch(err => {
      console.log(err)
    })
});
// Update
router.put('/request', requiresLogin, (req, res) => {
  if (!req.body._id) {
    //let error = new Error('Something wrong with db');

    res.statusCode = 400;
    res.statusMessage = 'The id field was not sent';

    return res.send();
  }

  Requests.update({
      _id: req.body._id
    }, {
      $set: {
        date: req.body.date,
        contactName: req.body.contactName,
        contactEmail: req.body.contactEmail,
        web: req.body.web,
        skype: req.body.skype,
        phone: req.body.phone,
        service: req.body.service,
        industry: req.body.industry,
        status: req.body.status,
        accountManager: req.body.accountManager
      }
    })
    .then(result => {
      res.send(`Updated request with id ${req.body._id}`)
    })
    .catch(err => {
      let error = new Error('Something wrong with db');
      error.code = 500;

      return res.send(error)
    })
});

router.post('/profile', function (req, res) {
  upload(req, res, function (err, file) {
    if (err) {
      // An error occurred when uploading
      res.send('Error in profile')
      return
    }
    res.send('Ok')

    // Everything went fine
  })
})

// Add
router.post('/request', upload.fields([{
  name: 'detailFiles'
}, {
  name: 'refFiles'
}]), (req, res) => {
  //req.files[0]
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

router.post('/project', (req, res) => {
  console.log("req host" + req.body.projectName);
  SmartProject(req.body).then(results => {
    res.send("" + results);
  }).catch(err => {
    res.send(err);
  })
  //res.send("project added");
});




router.post("/request-qa", async (req, res) => {
  const site = req.body.site;
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(site);

  if(site.indexOf('dropbox') >= 0) {
      const frames = await page.frames();
      const frame = frames.filter(f => {
          if (f.name() === 'preview-content') {
              return f
          }
      })
      await page.goto(frame[0]._url);
  };
  
  const bodyHTML = await page.evaluate(() => document.body.innerHTML);
  await browser.close();

  const html = entities.decode(bodyHTML);

  const word = wordCount(html);
  res.status(200).send({ word })
  
});

module.exports = router;
