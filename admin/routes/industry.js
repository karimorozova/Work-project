const router = require('express').Router();
const mv = require('mv');
const { Industries } = require('../models');
const { upload } = require('../utils/');

function moveIndustryIcon(oldFile, date) {
  let newFile = './dist/static/industries/' + date + '-' + oldFile.filename
  mv(oldFile.path, newFile, {
    mkdirp: true
  }, function (err) {
    if(err) {
      console.log(err);
    }
  });
  console.log('Flag icon moved!')
}

function moveExcelFile(oldFile, date) {
  let newFile = './dist/static/industries/exel/' + date + '-' + oldFile.filename
  mv(oldFile.path, newFile, {
    mkdirp: true
  }, function (err) {
    if(err) {
      console.log(err);
    }
  });
}

router.post("/saveindustries", upload.fields([{ name: "uploadedFileIcon" }, { name: "uploadedFile" }]), async (req, res) => {
  const industryID = req.body.dbIndex;
  let iconsArray = req.files["uploadedFileIcon"];
  let iconPath = "";
  const date = new Date().getTime();
  try {
    if(iconsArray) {
      await moveIndustryIcon(iconsArray[0], date);
      iconPath = `/static/industries/${date}-` + iconsArray[0].filename;
    }
    let genericArray = req.files["uploadedFile"];
    let genericPath = "";
    if (genericArray) {
      await moveExcelFile(genericArray[0], date);
      genericPath = `/static/industries/exel/${date}` + '-' + genericArray[0].filename;    
    }
    let nameVal = req.body.nameTitle;

    let objForUpdate = {
      active: req.body.activeFormValue
    };
    if(nameVal.length ) {
      objForUpdate.name = nameVal
    }
    if(iconPath) {
      objForUpdate.icon = iconPath
    }
    if(genericPath) {
      objForUpdate.generic = genericPath
    }
    await Industries.update({ "_id": industryID }, objForUpdate);
    res.send('done');
  } catch(err) {
    console.log(err);
    res.status(500).send('Something wrong on Industry saving');
  }
});

router.post("/removeindustries", async (req, res) => {
  const industryID = req.body.industryRem;
  try {
    await Industries.deleteOne({ "_id": industryID });
    res.send('Removed'); 
    } catch(err) {
      console.log(err);
      res.status(500).send('Something wrong on Industry removing');
    }
});

module.exports = router;