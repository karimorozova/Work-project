const router = require('express').Router();
const multer = require('multer');
const mv = require('mv');
const { Clients, Projects, Languages, Services, Industries } = require('../models');
const { getOneService, getManyServices, checkServiceRatesMatches, deleteServiceRate } = require('../services/');
const { receivablesCalc, payablesCalc, getProjects, getProject } = require('../projects/');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './dist/uploads/')
  },
  filename: function (req, file, cb) {
    console.log(file)
    cb(null, file.originalname)
  }
});

function moveServiceIcon(oldFile, date) {
  var newFile = './dist/static/services/' + date + '-' + oldFile.filename
  mv(oldFile.path, newFile, {
    mkdirp: true
  }, function (err) {
    if(err) {
      console.log(err);
    }
  });
  console.log('Flag icon moved!')
}

var uploadServices = multer({
  storage: storage
});

router.post("/saveservices", uploadServices.fields([{name: "uploadedFileIcon"}]), async (req, res) => {
  const serviceID = req.body.dbIndex;
  const serviceIcon = req.files["uploadedFileIcon"];
  let iconPath = "";
  let date = new Date().getTime();
  if (serviceIcon) {
    moveServiceIcon(serviceIcon[0], date);
    iconPath = `/static/services/${date}-` + serviceIcon[0].filename;
  }

  let objForUpdate = {
    active: req.body.activeFormValue,
    languageForm: req.body.languageFormValue,
    calculationUnit: req.body.calcFormValue
  };
  
  const nameVal = req.body.nameTitle;
  
  if (nameVal.length) {
    objForUpdate.title = nameVal;
  }

  if(iconPath.length) {
    objForUpdate.icon = iconPath;
  }

  Services.update({ "_id": serviceID }, objForUpdate).then(result => {
    res.send('Service updated')
  }).catch(err => {
    console.log(err);
    res.send('Something wrong...')
  });
});

router.post("/removeservices", async (req, res) => {
  const serviceID = req.body.serviceRem;
  Services.deleteOne({ "_id": serviceID })
    .then(result => {
      res.send('Removed');
    })
    .catch(err => {
      console.log(err);
    });
});

router.get('/costs', async (req, res) => {
  const projectId = req.query.projectId;
  try {
    let project = await getProject({"_id": projectId});
    for(let task of project.tasks) {
      const service = await getOneService({"_id": task.service});
      const combinations = service.languageCombinations;
      for(let step of project.steps) {
        const receivables = await receivablesCalc(task, project, step, combinations);
        const payables = step.vendor ? await payablesCalc(task, project, step) : "";
        if(step.taskId === task.id) {
          step.receivables = receivables;
          step.payables = payables;
          step.margin = (step.receivables - step.payables).toFixed(2);
        }
      }
    }
    project.receivables = project.steps.reduce((init, current) => {
      return +init + +current.receivables
    }, 0).toFixed(2);
    project.payables = project.steps.reduce((init, current) => {
      return +init + +current.payables
    }, 0).toFixed(2);
    await Projects.updateOne({"_id": projectId}, 
      {steps: project.steps, 
        receivables: project.receivables, 
        payables: project.payables});
    const updatedProject = await getProject({"_id": projectId});
    res.send(updatedProject);
  } catch(err) {
    console.log(err);
    res.status(500).send('Error on getting costs ' + err);
  }
})

router.post('/rates', async (req, res) => {
  try {
    let rate = req.body;
    let rates = [];
    let industries = await Industries.find();
    let service = await getOneService({'title': rate.title});

    for(let indus of rate.industry) {
      for(let industry of industries) {
        if(industry.name == indus.name || indus.name == 'All') {
          if(service.languageForm === 'Duo') {
            industry.rate = indus.rate;
            industry.active = indus.active;
          } else {
            industry.rate = indus.rate;
            industry.active = indus.active;
            industry.package = indus.package;
          }
        }
      }
    }
    industries = industries.map(item => {
      if(service.languageForm === 'Duo') {
        return {industry: item._id, active: item.active, rate: item.rate}
      } 
      return {industry: item._id, active: item.active, rate: item.rate, package: item.package}
    })
    const result = await checkServiceRatesMatches(service, industries, rate);
    res.send(result);  
  } catch(err) {
      console.log(err)
      res.status(500).send('Error on adding/updating the rate');
  }
})

router.post('/several-langs', async (req, res) => {
  let langCombs = req.body;
  let industries = await Industries.find();
  industries = JSON.stringify(industries);
  let services = await getManyServices({languageForm: "Duo"});
  for(let comb of langCombs) {
    let service = services.find(item => {
      return item.title == comb.service.title
    });
    let exist = false;
    for(let servComb of service.languageCombinations) {
      if(comb.source.lang == servComb.source.lang && comb.target.lang == servComb.target.lang) {
        for(let indus of servComb.industries) {
          for(let ind of comb.industry) {
            if(indus.name == ind.name) {
              indus.rate = ind.rate
            }
          }
        }
        exist = true;
      }
    }
    if(!exist) {
      let industry = JSON.parse(industries);
      for(let indus of industry) {
        for(let ind of comb.industry) {
          if(indus.name == ind.name) {
            indus.rate = ind.rate;
            indus.active = true;
          } else {
            indus.rate = 0;
            indus.active = false;
          }
        }
      }
      service.languageCombinations.push({
        source: comb.source,
        target: comb.target,
        industries: industry,
        active: true
      })
      let result = await Services.updateOne({"_id": service._id}, {$set: {languageCombinations: service.languageCombinations}})
    } else {
      let result = await Services.updateOne({"_id": service._id}, {$set: {languageCombinations: service.languageCombinations}})
    }
  }
  res.send('Several langs added..')
})

router.delete('/rate/:id', async (req, res) => {
  const { serviceId, industries } = req.body;
  const { id } = req.params;
  if(id === "undefined") {
    return res.send('Empty row deleted');
  }
  try {
    const service = await getOneService({'_id': serviceId});
    const result = await deleteServiceRate(service, industries, id);
    res.send(result);
  } catch(err) {
    console.log(err);
    res.status(500).send('Error on deleting the rate');
  }
})

router.get('/parsed-rates', async (req, res) => {
  try{
    let service = await getOneService({title: req.query.title, languageForm: req.query.form});
    let rates = [];
    for(let comb of service.languageCombinations) {
      for(let elem of comb.industries) {
        if(elem.rate > 0) {
          let industry = {...elem.industry._doc};
          industry.rate = elem.rate;
          industry.active = elem.active;
          if(req.query.form === "Duo") {
            rates.push({
              id: comb._id,
              title: service.title,
              sourceLanguage: comb.source,
              targetLanguage: comb.target,
              industry: [industry],
            })
          } else {
            industry.package = elem.package;
            rates.push({
              id: comb._id,
              title: service.title,
              targetLanguage: comb.target,
              industry: [industry],
            })
          }
        }
      }
    }
    res.send(rates);
  } catch(err) {
    console.log(err);
    res.status(500).send('Something went wrong!' + err)
  }
})

module.exports = router;