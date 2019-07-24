const router = require('express').Router();
const { upload } = require('../utils/');
const { Services, Pricelist } = require('../models');
const { updatePricelistRate, deleteRate, updateLangCombs } = require('../services/');
const { getProject, getProjectWithUpdatedFinance } = require('../projects/');
const { getAfterPayablesUpdated, setDefaultStepVendors, updateProjectCosts } = require('../calculations');
const { getAllRates } = require('../services/getRates'); 
const { createNewService, updateService, deleteServiceIcon } = require('../settings');

router.post("/service/:id", upload.fields([{name: "icon"}]), async (req, res) => {
  const { title, languageForm, calculationUnit, steps, active, symbol, sortIndex, projectType } = req.body;
  const  { id } = req.params;
  const isActive = active === "true" ? true : false;
  const iconFile = req.files["icon"];
  const serviceSteps = JSON.parse(steps);
  try {
    if(id === "new") {
      await createNewService({
        title, active: isActive, iconFile, languageForm, calculationUnit, symbol, sortIndex, projectType, steps: serviceSteps
      });
    } else {
      await updateService({id, title, active: isActive, iconFile, languageForm, calculationUnit, steps: serviceSteps});
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
    const updatedProject = await updateProjectCosts({...projectToUpdate, steps, tasks});
    res.send(updatedProject);
  } catch(err) {
    console.log(err);
    res.status(500).send('Error on getting costs');
  }
})

router.post('/step-payables', async (req, res) => {
  let { projectId, step, index } = req.body;
  try {
    const updatedProject = await getAfterPayablesUpdated({ projectId, step, index});
    res.send(updatedProject);
  } catch(err) {
    console.log(err);
    res.status(500).send('Error on getting step payables');
  }
})

router.post('/rates', async (req, res) => {
    try {
        const { info, priceId } = req.body;
        const result = await updatePricelistRate(info, priceId);
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