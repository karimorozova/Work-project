const router = require('express').Router();
const { upload } = require('../utils/');
const { Services, Pricelist } = require('../models');
const { createNewRate, updateRate, deleteRate, updateLangCombs } = require('../services/');
const { payablesCalc, updateProjectCosts, getProject, updateProject, updateTaskMetrics, setDefaultStepVendors, getProjectWithUpdatedFinance } = require('../projects/');
const { getAllRates } = require('../services/getRates'); 
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
    let projectToUpdate = await getProjectWithUpdatedFinance(project);
    const { steps, tasks } = await setDefaultStepVendors(projectToUpdate);
    projectToUpdate.steps = steps;
    projectToUpdate.tasks = tasks;
    const updatedProject = await updateProjectCosts(projectToUpdate);
    res.send(updatedProject);
  } catch(err) {
    console.log(err);
    res.status(500).send('Error on getting costs');
  }
})

router.post('/step-payables', async (req, res) => {
  let { projectId, step, index } = req.body;
  try {
    const queryStr = `steps.${index}`;
    let project = await updateProject({"_id": projectId}, {$set: {[queryStr]: step}});
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
    const { info, priceId } = req.body;
    const { industries, languageForm, id } = info;
    const priceList = await Pricelist.findOne({"_id": priceId}).populate("combinations.industries.industry");
    let { combinations } = priceList;
    let rateIndex = id ? combinations.findIndex(item => item.id === id) : -1;
    if(rateIndex !== -1) {
      const rate = combinations[rateIndex];
      const { updatedIndustries } = await updateRate(rate, industries, languageForm);
      combinations[rateIndex].industries = updatedIndustries;
      await Pricelist.updateOne({"_id": priceId}, {"combinations": combinations});
      return res.send("Prcielist's rate Updated");
    }
    const result = await createNewRate(info, priceId);
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

router.delete('/rate/:priceId', async (req, res) => {
  const { industries, servicesIds, id } = req.body;
  const { priceId } = req.params;
  try {
    await deleteRate({
      priceId,
      rateId: id, 
      industries, 
      services: servicesIds
    });
    res.send("deleted");
  } catch(err) {
    console.log(err);
    res.status(500).send('Error on deleting the rate');
  }
})

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