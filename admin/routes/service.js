const router = require('express').Router();
const { upload } = require('../utils/');
const { Services, Industries, Duorate, Monorate } = require('../models');
const { getOneService, getManyServices, createNewRate, updateRate, deleteRate, updateLangCombs } = require('../services/');
const { receivablesCalc, payablesCalc, updateProjectCosts, getProjects, getProject, updateTaskMetrics } = require('../projects/');
const { getAllRates } = require('../services/getRates'); 
const { getDuoRate, getMonoRate } = require('../rates');
const { createNewService, updateService, deleteServiceIcon } = require('../settings');

router.post("/service/:id", upload.fields([{name: "icon"}]), async (req, res) => {
  const { title, languageForm, calculationUnit, active, symbol, sortIndex, projectType } = req.body;
  const  { id } = req.params;
  const isActive = active === "true" ? true : false;
  const iconFile = req.files["icon"];
  try {
    if(id === "new") {
      await createNewService({
        title, active: isActive, iconFile, languageForm, calculationUnit, symbol, sortIndex, projectType
      });
    } else {
      await updateService({id, title, active: isActive, iconFile, languageForm, calculationUnit});
    }
    res.send('Saved');
  } catch(err) {
    console.log(err);
    res.status(500).send('Something wrong on Service creating/updating');
  }
});

router.delete("/service/:id", async (req, res) => {
  const { id } = req.params;
  const { icon } = req.body;
  try {
    await Services.deleteOne({"_id": id});
    await deleteServiceIcon(icon);
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
      for(let step of projectToUpdate.steps) {
        if(step.taskId === task.taskId) {
          const receivables = step.finance['Price'].receivables ? {rate: step.clientRate, cost: step.finance['Price'].receivables}
          : await receivablesCalc({task, project: projectToUpdate, step});
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
    : await Monorate.findOne({"target": info.targetLanguage._id, "package": info.package}).populate("industries.industry");
    if(rate) {
      const { updatedIndustries } = await updateRate(rate, info.industries, info.languageForm);
      const result = languageForm === "Duo" ? await Duorate.findOneAndUpdate({"_id": rate._id}, {"industries": updatedIndustries})
      : await Monorate.findOneAndUpdate({"_id": rate._id}, {"industries": updatedIndustries});
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
  let { combinations } = req.body;
  try {
      await updateLangCombs(combinations);
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

// router.get("/parsed-rates",  async (req, res) => {
//   const { form } = req.query;
//   try {
//     const rates = await getAllRates(form);
//     res.send(rates); 
//   } catch(err) {
//     console.log(err);
//     res.send("error");
//   }
// })

router.get("/parsed-rates",  async (req, res) => {
  const { id, form } = req.query;
  try {
    const rates = await getAllRates(form, id);
    res.send(rates); 
  } catch(err) {
    console.log(err);
    res.send("error");
  }
})

module.exports = router;