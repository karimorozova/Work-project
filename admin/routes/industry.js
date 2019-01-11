const router = require('express').Router();
const { Industries } = require('../models');
const { upload } = require('../utils/');
const { createNewIndustry, updateIndustry, deleteIndustryFiles } = require('../settings');

router.post("/industry/:id", upload.fields([{ name: "icon" }, { name: "generic" }]), async (req, res) => {
  const { name, active } = req.body;
  const { id } = req.params;
  const isActive = active === "true" ? true : false;
  const iconFile = req.files["icon"];
  const genericFile = req.files["generic"];
  try {
    if(id === "new") {
      await createNewIndustry({name, active: isActive, iconFile, genericFile});
    } else {
      await updateIndustry({id, name, active: isActive, iconFile, genericFile});
    }
    res.send('Saved');
  } catch(err) {
    console.log(err);
    res.status(500).send('Something wrong on Industry creating');
  }
});

router.delete("/industry/:id", async (req, res) => {
  const { id } = req.params;
  const { icon, generic } = req.body;
  try {
    await Industries.deleteOne({"_id": id});
    await deleteIndustryFiles(icon, generic);
    res.send('Removed'); 
    } catch(err) {
      console.log(err);
      res.status(500).send('Something wrong on Industry removing');
    }
});

module.exports = router;