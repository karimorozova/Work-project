const router = require('express').Router();
const axios = require('axios');
const unirest = require('unirest');
const HomeApi = require('../models/xtrf/home');
const ClientApi = require('../models/xtrf/client');
const { upload, sendMail, sendMailClient, sendMailPortal } = require('../utils/');
const fs = require('fs');
const mv = require('mv');
const { Requests, Languages, Industries, Timezones, LeadSource, Package } = require('../models');
const { quote, project } = require('../models/xtrf');
const { getProject, getProjects } = require('../projects/');
const { getManyServices } = require('../services/');
const reqq = require('request');
const writeFile = require('write');
const { getAllCountries } = require('../helpers/countries');


function moveFile(oldFile, requestId) {

  let newFile = './dist/reqfiles/' + requestId + '/' + oldFile.filename;

  mv(oldFile.path, newFile, {
    mkdirp: true
  }, function (err) {
    if(err) {
      console.log("moveFile error in posting request: " + err);
    }
  });

  return oldFile.filename;
}

function moveLangIcon(oldFile, date) {
  let newFile = './dist/static/flags31x21pix/' + date + '-' + oldFile.filename;
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
  let link = req.query.web;
  if (link.indexOf('dropbox') >= 0) {
    let firstPart = link.split("=")[0];
    link = firstPart + "=1";
  }
  try {
    const resFull = await axios({
      url: link,
      method: 'GET',
      responseType: 'blob', // important
    });
    let wstream = await reqq(link).pipe(fs.createWriteStream('./dist/testtest.txt'));
    wstream.write(resFull.data);
    wstream.end(() => {
      unirest.post('https://pangea.s.xtrf.eu/qrf/file')
        .headers({ 'Content-Type': 'multipart/form-data' })
        .attach('file', './dist/testtest.txt') // Attachment
        .end(function (response) {
          let token = response.body.token;
          fs.unlink('./dist/testtest.txt', (err) => {
            if (err) throw err;
            console.log("testtеst.txt was deleted!")
          });
          console.log('done');
          res.send({ token });
        });
    });
  } catch(err) {
    console.log(err);
    res.status(500).send('Error on getting wordcount');
  }
});


router.post('/request', upload.fields([{ name: 'detailFiles' }, { name: 'refFiles' }]), async (req, res) => {
  try {
  const request = new Requests(req.body);
  let projectName = "";
  if (request.projectName) {
    projectName = request.projectName;
  }

  if (req.body.genBrief) {
    let obj = JSON.parse(req.body.genBrief);
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
  }

  const detailFiles = req.files["detailFiles"];
  const refFiles = req.files["refFiles"];

  request.sourceLanguage = JSON.parse(req.body.sourceLanguage);
  request.targetLanguages = JSON.parse(req.body.targetLanguages);
  request.service = JSON.parse(req.body.service);
  
  await request.save();
  if (detailFiles) {
    for (let i = 0; i < detailFiles.length; i += 1) {
      try {
        let storedFile = await moveFile(detailFiles[i], request.id);
        request.detailFiles.push(storedFile);
      } catch(err) {
        console.log(err);
      }
    }
  }
  if (refFiles) {
    for (let i = 0; i < refFiles.length; i += 1) {
      try {
        let storedFile = await moveFile(refFiles[i], request.id);
        request.refFiles.push(storedFile);
      } catch(err) {
        console.log(err);
      }
    }
  }

  await request.save();
  if (projectName) {
    await sendMailPortal(request);
    quote(request);
  } else {
    await sendMail(request);
  }
  await sendMailClient(request);
  // quote(request);
  console.log("Saved");
  res.send({
    message: "request was added"
  });
  } catch (err) {
      console.log(err);
      res.status(500).send("Something went wrong while adding request")
    }
});

router.post('/project-request', upload.fields([{ name: 'detailFiles' }, { name: 'refFiles' }]), async (req, res) => {
  try {
  const request = new Requests(req.body);
  let projectName = "";
  if (request.projectName) {
    projectName = request.projectName;
  }

  if (req.body.genBrief) {
    let obj = JSON.parse(req.body.genBrief);
    
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
  }

  const detailFiles = req.files["detailFiles"];
  const refFiles = req.files["refFiles"];

  request.sourceLanguage = JSON.parse(req.body.sourceLanguage);
  request.targetLanguages = JSON.parse(req.body.targetLanguages);
  request.service = JSON.parse(req.body.service)

  await request.save();
  if (detailFiles) {
    for (let i = 0; i < detailFiles.length; i += 1) {
      request.detailFiles.push(moveFile(detailFiles[i], request.id));
    }
  }
  if (refFiles) {
    for (let i = 0; i < refFiles.length; i += 1) {
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
  
  res.send({
    message: "request was added"
  });
  } catch (err) {
    console.log(err);
    res.status(500).send("Something went wrong while adding request")
  }
});

router.get('/allprojects', async (req, res) => {
  try {
    const projects = await getProjects({});
    res.send(projects)
  } catch(err) {
      console.log(err);
      res.status(500);
      res.send('Something wrong with DB while getting projects!')
    }
})

router.get('/languages', async (req, res) => {
  try {
    const languages = await Languages.find({});
    res.send(languages)
  } catch(err) {
      console.log(err)
      res.status(500);
      res.send('Something wrong with DB / Cannot get languages')
    }
});

router.get('/services', async (req, res) => {
  try {
  const services = await getManyServices({});
    res.send(services);
  } catch(err) {
      console.log(err)
      res.status(500);
      res.send('Something wrong with DB / Cannot get Services');
  }
});

router.get('/industries', async (req, res) => {
  try {
  const industries = await Industries.find({});
    res.send(industries)
  } catch(err) {
    console.log(err);
    res.status(500);
    res.send('Something wrong with DB / Cannot get Industries');
  }
});

router.get('/timezones', async (req, res) => {
  try {  
    const timezones = await Timezones.find({});
    res.send(timezones)
  } catch(err) {
      console.log(err);
      res.status(500);
      res.send('Something wrong with DB / Cannot get Timezones');
  }
})

router.get('/customers', async (req, res) => {
  try{
    let customers = await HomeApi.getAllCustomers();
    res.send(customers)
  } catch(err) {
    console.log(err);
    res.statusCode(500);
    res.send('Error / Cannot get Customers from XTRF');
  }
})

router.get('/person', async (req, res) => {
  try{
    let person = await HomeApi.getPerson(req.query.customerId);
    let email = {'email': person};
    res.send(email);
  } catch(err) {
    res.statusCode(500);
    res.send('Error / Cannot get Person from XTRF');
  }
})

router.post('/get-token', async (req, res) => {
  let email = {'email': req.body.email};
  try {
    let token = await HomeApi.getTokenCircular(email);
    res.send(token);
  } catch (err) {
    console.log(err);
    res.statusCode(500);
    res.send('Error / Cannot get Token from XTRF');
  }
})

router.post('/token-session', async (req, res) => {
  try {
    let sessionId = await ClientApi.login(req.body.token.body);
      res.send(sessionId);
  } catch(err) {
    console.log(err);
    res.statusCode(500);
    res.send('Error / Cannot open Token-session in XTRF');
  }
  
})

router.put("/languages/:id", upload.fields([{name: "flag"}]), async (req, res) => {
  const { active, icon } = req.body;
  const flag = req.files["flag"];
  const { id }= req.params;
  const isActive = active ? true : false;
  try {
    if(!flag) {
      await Languages.updateOne({"_id": id}, {"active": isActive});
      return res.send("Updated");
    }
    const date = new Date();
    const formattedDate = `${date.getDay()}-${date.getMonth()+1}-${date.getFullYear()}`;
    await moveLangIcon(flag[0], formattedDate);
    const newIcon = `/static/flags31x21pix/${formattedDate}-` + flag[0].filename;
    await fs.unlink(`./dist${icon}`, (err) => {
      if(err) console.log("Error on file deleting " + err);
    });
    await Languages.updateOne({"_id": id}, {"active": isActive, "icon": newIcon});
    res.send('Updated');
  } catch(err) {
    console.log(err);
    res.status(500).send('Something went wrong while Language saving');
  }
});

router.post("/removelanguages", async(req, res) => {
  const langID = req.body.languageRem;
  try {
    await Languages.deleteOne({"_id": langID})
    res.send('Removed')
  } catch(err) {
    console.log(err);
    res.status(500).send('Something is wrong with Language removing')
  }
});

router.get('/countries', (req, res) => {
  try {
    const countries = getAllCountries();
    res.send(countries);
  } catch(err) {
    console.log(err)
    res.status(500).send("Error on getting countries");
  }
})

router.get('/leadsources', async (req, res) => {
  try {
    const leadsources = await LeadSource.find({});
    res.send(leadsources);
  } catch(err) {
    console.log(err);
    res.status(500).send("Error on getting lead sources from DB")
  }
})

router.post('/update-leadsource', async (req, res) => {
  const { leadSource } = req.body;
  try {
    if(leadSource._id) {
      await LeadSource.updateOne({"_id": leadSource._id}, leadSource);
      return res.send("Updated");
    }
    await LeadSource.create(leadSource);
    res.send("New lead source created");
  } catch(err) {
    console.log(err);
    res.status(500).send("Error on updating/creating a lead source")
  }
})

router.delete('/lead-source/:id', async (req, res) => {
  const { id } = req.params;
  if(!id) {
    return res.send('Deleted unsaved lead source')
  }
  try {
    await LeadSource.deleteOne({"_id": id});
    res.send('Deleted');
  } catch(err) {
    console.log(err);
    res.status(500).send("Error on deleting lead source");
  }
})

router.get('/packages', async (req, res) => {
  try {
    const packages = await Package.find({});
    res.send(packages);
  } catch(err) {
    console.log(err);
    res.status(500).send("Error on getting packages from DB")
  }
})

router.post('/update-package', async (req, res) => {
  const { package } = req.body;
  try {
    if(package._id) {
      await Package.updateOne({"_id": package._id}, package);
      return res.send('Updated');
    }
    await Package.create(package);
    res.send('New package saved.');
  } catch(err) {
    console.log(err);
    res.status(500).send("Error on updating/creating a package")
  }
})

router.delete('/package/:id', async (req, res) => {
  const { id } = req.params;
  try {
    if(!id) {
      return res.send("Deleted unsaved package");
    }
    await Package.deleteOne({"_id": id});
    res.send("Package deleted");
  } catch(err) {
    console.log(err);
    res.status(500).send("Error on deleting package")
  }
})

module.exports = router;