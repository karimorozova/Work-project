const router = require('express').Router();
const { upload } = require('../utils/');
const { Services } = require('../models');
const { Languages } = require('../models');
const { createNewService, updateService, deleteServiceIcon } = require('../settings');

router.post("/service/:id", upload.fields([{name: "icon"}]), async (req, res) => {

  const { title, languageForm, steps, active  } = req.body;
  const  { id } = req.params;
  const isActive = active === "true" ? true : false;
  const serviceSteps = JSON.parse(steps);
  // const source = languageForm == "Duo" ?  true : false;
  
  const allLanguagesSymbol = await Languages.find({$and: [{active: true}]})
  // const allLanguagesSymbolFormat = allLanguagesSymbol.map(item => item.symbol);


  try {
    //TODO: refactoring Services/Step
    if(id === "new") {
      await createNewService({
        title, active: isActive, languageForm,   steps: serviceSteps
      });
    } else {
      await updateService({id, title, active: isActive,   languageForm, steps: serviceSteps});
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

module.exports = router;
