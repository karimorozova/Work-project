const router = require('express').Router();
const multer = require('multer');
const mv = require('mv');
const { upload } = require('../utils/');
const { Services, Industries, Duorate, Monorate } = require('../models');
const { getOneService, getManyServices, checkServiceRatesMatches, deleteServiceRate, createNewRate, updateRate, deleteDuoRate, updateLangCombs } = require('../services/');
const { receivablesCalc, payablesCalc, updateProjectCosts, getProjects, getProject, updateTaskMetrics } = require('../projects/');
const { getAllDuoRates } = require('../services/getRates'); 
const { getDuoRate } = require('../rates');

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

router.post("/saveservices", upload.fields([{name: "uploadedFileIcon"}]), async (req, res) => {
  const serviceId = req.body.dbIndex;
  const serviceIcon = req.files["uploadedFileIcon"];
  let iconPath = "";
  const  date = new Date().getTime();
  try {
    if (serviceIcon) {
      await moveServiceIcon(serviceIcon[0], date);
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

    await Services.update({ "_id": serviceId }, objForUpdate);
    res.send('Service updated')
  } catch(err) {
    console.log(err);
    res.status(500).send('Error / Cannot save Service')
  }
});

router.post("/removeservices", async (req, res) => {
  const serviceId = req.body.serviceRem;
  try {
    await Services.deleteOne({ "_id": serviceId });
    res.send('Removed');
  } catch(err) {
      console.log(err);
      res.status(500).send('Error / Cannot remove Service')
    }
});

router.get('/costs', async (req, res) => {
  const { projectId } = req.query;
  try {
    let project = await getProject({"_id": projectId});
    let projectToUpdate = {...project._doc, id: projectId};
    for(let task of projectToUpdate.tasks) {
      const service = await getOneService({"_id": task.service});
      const combinations = service.languageCombinations;
      for(let step of projectToUpdate.steps) {
        if(step.taskId === task.taskId) {
          const receivables = step.finance['Price'].receivables ? {rate: step.clientRate, cost: step.finance['Price'].receivables}
          : await receivablesCalc({task, project: projectToUpdate, step, combs: combinations});
          step.clientRate = receivables.rate;
          step.finance['Price'].receivables = receivables.cost;
        }
      }
      task.finance['Price'].receivables = projectToUpdate.steps.filter(item => item.taskId === task.taskId)
      .reduce((init,cur) => init + +cur.finance['Price'].receivables, 0).toFixed(2);
    }
    const updatedProject = await updateProjectCosts(projectToUpdate);
    res.send(updatedProject);
  } catch(err) {
    console.log(err);
    res.status(500).send('Error on getting costs');
  }
})

router.post('/step-payables', async (req, res) => {
  let { projectId, step } = req.body;
  try {
    let project = await getProject({"_id": projectId});
    let projectToUpdate = {...project._doc, id: projectId};
    const taskIndex = project.tasks.findIndex(item => {
      return item.taskId == step.taskId;
    })
    const updatedMetrics = await updateTaskMetrics(project.tasks[taskIndex].metrics, step.vendor._id);
    let updatedTask = {...project.tasks[taskIndex]};
    updatedTask.metrics = updatedMetrics;
    const stepIndex = project.steps.findIndex(item => {
      return item.taskId == step.taskId && item.name === step.name;
    })
    projectToUpdate.steps[stepIndex] = await payablesCalc({task: updatedTask, project, step});
    updatedTask.finance['Price'].payables = projectToUpdate.steps.filter(item => item.taskId === updatedTask.taskId)
    .reduce((init, cur) => init + +cur.finance['Price'].payables, 0).toFixed(2);
    projectToUpdate.tasks[taskIndex] = updatedTask;
    const updatedProject = await updateProjectCosts(projectToUpdate);
    res.send(updatedProject);
  } catch(err) {
    console.log(err);
    res.status(500).send('Error on getting step payables');
  }
})

router.post('/rates', async (req, res) => {
  try {
    const { info } = req.body;
    let duoRate = await Duorate.findOne({"source": info.sourceLanguage._id, "target": info.targetLanguage._id})
      .populate("industries.industry");
    if(duoRate) {
      const { updatedIndustries } = await updateRate(duoRate, info.industries, info.languageForm);
      const result = await Duorate.findOneAndUpdate({"_id": duoRate._id}, {'industries': updatedIndustries});
      return res.send(result);
    }
    const result = await createNewRate(info);
    res.send(result);
    // let rate = req.body;
    // let industries = await Industries.find();
    // let service = await getOneService({'title': rate.title});

    // for(let indus of rate.industry) {
    //   for(let industry of industries) {
    //     if(industry.name == indus.name || indus.name == 'All') {
    //       if(service.languageForm === 'Duo') {
    //         industry.rate = indus.rate;
    //         industry.active = indus.active;
    //       } else {
    //         industry.rate = indus.rate;
    //         industry.active = indus.active;
    //         industry.package = indus.package;
    //       }
    //     }
    //   }
    // }
    // industries = industries.map(item => {
    //   if(service.languageForm === 'Duo') {
    //     return {industry: item._id, active: item.active, rate: item.rate}
    //   } 
    //   return {industry: item._id, active: item.active, rate: item.rate, package: item.package}
    // })
    // const result = await checkServiceRatesMatches(service, industries, rate);
    // res.send(result);  
  } catch(err) {
      console.log(err)
      res.status(500).send('Error on adding/updating the rate');
  }
})

router.post('/several-langs', async (req, res) => {
  let langCombs = req.body;
  try {
    let industries = await Industries.find();
    let services = await getManyServices({languageForm: "Duo"});
    for(let comb of langCombs) {
      let service = services.find(item => {
        return item.id === comb.service._id
      });
      await updateLangCombs({
        serviceId: service.id,
        comb: comb,
        serviceCombinations: service.languageCombinations,
        industries: industries
      })
    }
    res.send('Several langs added..');
  } catch(err) {
    console.log(err)
    res.status(500).send('Error on adding several language combinations');
  }
})

router.delete('/rate/:id', async (req, res) => {
  // const { serviceId, industries } = req.body;
  const { industries, servicesIds } = req.body;
  const { id } = req.params;
  if(id === "undefined") {
    return res.send('Empty row deleted');
  }
  try {
    const rate = await getDuoRate({"_id": id});
    const result = await deleteDuoRate(rate, industries, servicesIds);
    // const service = await getOneService({'_id': serviceId});
    // const result = await deleteServiceRate(service, industries, id);
    res.send("deleted");
  } catch(err) {
    console.log(err);
    res.status(500).send('Error on deleting the rate');
  }
})

// router.get('/parsed-rates', async (req, res) => {
//   try{
//     let service = await getOneService({title: req.query.title, languageForm: req.query.form});
//     let rates = [];
//     for(let comb of service.languageCombinations) {
//       for(let elem of comb.industries) {
//         if(elem.rate > 0) {
//           let industry = {...elem.industry._doc};
//           industry.rate = elem.rate;
//           industry.active = elem.active;
//           if(req.query.form === "Duo") {
//             rates.push({
//               id: comb._id,
//               title: service.title,
//               sourceLanguage: comb.source,
//               targetLanguage: comb.target,
//               industry: [industry]
//             })
//           } else {
//             industry.package = elem.package;
//             rates.push({
//               id: comb._id,
//               title: service.title,
//               targetLanguage: comb.target,
//               industry: [industry]
//             })
//           }
//         }
//       }
//     }
//     res.send(rates);
//   } catch(err) {
//     console.log(err);
//     res.status(500).send('Error on getting rates!')
//   }
// })

router.get("/parsed-rates",  async (req, res) => {
  try {
    const rates = await getAllDuoRates();
    res.send(rates); 
  } catch(err) {
    console.log(err);
    res.send("error");
  }
})

module.exports = router;