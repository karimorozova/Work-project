const router = require('express').Router();
const multer = require('multer');
const mv = require('mv');
const { upload } = require('../utils/');
const { Services, Industries, Duorate, Monorate } = require('../models');
const { getOneService, getManyServices, createNewRate, updateRate, deleteRate, updateLangCombs } = require('../services/');
const { receivablesCalc, payablesCalc, updateProjectCosts, getProjects, getProject, updateTaskMetrics } = require('../projects/');
const { getAllRates } = require('../services/getRates'); 
const { getDuoRate, getMonoRate } = require('../rates');

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
    const { languageForm } = info;
    let rate = languageForm === "Duo" ? await Duorate.findOne({"source": info.sourceLanguage._id, "target": info.targetLanguage._id})
      .populate("industries.industry") 
    : await Monorate.findOne({"target": info.targetLanguage._id}).populate("industries.industry");
    if(rate) {
      const { updatedIndustries } = await updateRate(rate, info.industries, info.languageForm);
      const result = languageForm === "Duo" ? await Duorate.findOneAndUpdate({"_id": rate._id}, {"industries": updatedIndustries})
      : await Monorate.findOneAndUpdate({"_id": rate._id}, {"package": info.package, "industries": updatedIndustries});
      return res.send(result);
    }
    const result = await createNewRate(info);
    res.send(result);
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
  const { industries, servicesIds, languageForm } = req.body;
  const { id } = req.params;
  if(id === "undefined") {
    return res.send('Empty row deleted');
  }
  try {
    const rate = languageForm === "Duo" ? await getDuoRate({"_id": id}) : await getMonoRate({"_id": id});
    const result = await deleteRate({rate, industries, services: servicesIds, languageForm});
    res.send("deleted");
  } catch(err) {
    console.log(err);
    res.status(500).send('Error on deleting the rate');
  }
})

router.get("/parsed-rates",  async (req, res) => {
  const { form } = req.query;
  try {
    const rates = await getAllRates(form);
    res.send(rates); 
  } catch(err) {
    console.log(err);
    res.send("error");
  }
})

module.exports = router;