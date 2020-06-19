const router = require('express').Router();
const { upload } = require('../utils/');
const { Services } = require('../models');
const { Languages } = require('../models');
const { createNewService, updateService, deleteServiceIcon } = require('../settings');

router.post("/service/:id", upload.fields([{name: "icon"}]), async (req, res) => {
  const { title, languageForm, calculationUnit, steps, active, isRequestQuote, symbol, sortIndex, projectType } = req.body;
  const  { id } = req.params;
  
  const isActive = active === "true" ? true : false;
  isRequestQuote === "true" ? true : false;
  const iconFile = req.files["icon"];
  const serviceSteps = JSON.parse(steps);
  const source = languageForm == "Duo" ?  true : false;
  
  const allLanguagesSymbol = await Languages.find({$and: [{active: true}]})
  const allLanguagesSymbolFormat = allLanguagesSymbol.map(item => item.symbol);
  
  const languages = [{
    source: !!source ? allLanguagesSymbolFormat : [],
    target: allLanguagesSymbolFormat
  }]

  try {
    if(id === "new") {
      await createNewService({
        title, active: isActive, isRequestQuote, iconFile, languages, source, languageForm, calculationUnit, symbol, sortIndex, projectType, steps: serviceSteps
      });
    } else {
      await updateService({id, title, source, active: isActive, languages, isRequestQuote, iconFile, languageForm, calculationUnit, steps: serviceSteps});
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