const router = require('express').Router();
const axios = require('axios');
const unirest = require('unirest');
const { upload } = require('../utils/');
const fs = require('fs');
const { Languages, Industries, Timezones, LeadSource, Group, Step, Package, Instruction, CancelReason, DiscountChart, User, ClientRequest, TierLqa } = require('../models');
const { getFilteredProjects, getPdf } = require('../projects/');
const { getFilteredClientRequests } = require('../clientRequests');
const { getServices } = require('../services/');
const reqq = require('request');
const { getAllCountries } = require('../helpers/countries');
const { updateLanguage } = require('../settings');
const { createNewRequest } = require("../requests");
const { getUnits } = require('../units');

router.get('/wordcount', async (req, res) => {
  let link = req.query.web;
  if (link.indexOf('dropbox') >= 0) {
    let firstPart = link.split("=")[0];
    link = firstPart + "=1";
  }
  try {
    const resFull = await axios({
      url: link,
      method: 'GET',
      responseType: 'blob', // important
    });
    let wstream = await reqq(link).pipe(fs.createWriteStream('./dist/testtest.txt'));
    wstream.write(resFull.data);
    wstream.end(() => {
      unirest.post('https://pangea.s.xtrf.eu/qrf/file')
        .headers({ 'Content-Type': 'multipart/form-data' })
        .attach('file', './dist/testtest.txt') // Attachment
        .end(function (response) {
          let token = response.body.token;
          fs.unlink('./dist/testtest.txt', (err) => {
            if (err) throw err;
            console.log("testtеst.txt was deleted!")
          });
          console.log('done');
          res.send({ token });
        });
    });
  } catch(err) {
    console.log(err);
    res.status(500).send('Error on getting wordcount');
  }
});


router.post('/request', upload.fields([{ name: 'detailFiles' }, { name: 'refFiles' }]), async (req, res) => {
    try {
        const requestData = req.body;
        const detailFiles = req.files["detailFiles"];
        const refFiles = req.files["refFiles"];
        await createNewRequest({requestData, detailFiles, refFiles});
        res.send({message: "request was added"});
  } catch (err) {
      console.log(err);
      res.status(500).send("Something went wrong while adding request")
    }
});

router.post('/allprojects', async (req, res) => {
    const filters = {...req.body};
    try {
        const projects = await getFilteredProjects(filters);
        res.send(projects)
    } catch(err) {
        console.log(err);
        res.status(500).send('Something wrong with DB while getting projects!');
    }
});

router.post('/all-requests', async (req, res) => {
    const filters = {...req.body};
    try {
        const requests = await getFilteredClientRequests(filters);
        res.send(requests);
    } catch(err) {
        console.log(err);
        res.status(500).send('Something wrong with DB while getting requests!');
    }
});

router.get('/requests-quantity', async (req, res) => {
    try {
        const quantity = await ClientRequest.countDocuments({status: {$ne: 'Cancelled'}});
        res.send({quantity});
    } catch(err) {
        console.log(err);
        res.status(500).send('Something wrong with DB while getting requests quantity');
    }
})

router.get('/languages', async (req, res) => {
  try {
    const languages = await Languages.find({});
    res.send(languages)
  } catch(err) {
      console.log(err);
      res.status(500).send('Something wrong with DB / Cannot get languages');
    }
});

router.get('/services', async (req, res) => {
  try {
    const { filter } = req.query;
    let services = await getServices();
    if(filter) {
        services = services.filter(item => item.active);  
    }
    res.send(services);
  } catch(err) {
      console.log(err);
      res.status(500).send('Something wrong with DB / Cannot get Services');
  }
});

router.get('/industries', async (req, res) => {
  try {
    const industries = await Industries.find({});
    const lastIndustryIndex = industries.findIndex(item => item.isLast);
    const lastIndustry = industries.splice(lastIndustryIndex, 1);
    const sortedIndustries = industries.sort( (a,b) => {
        if(a.name < b.name) return -1;
        if(a.name > b.name) return 1;
    });
    sortedIndustries.push(lastIndustry[0]);
    res.send(sortedIndustries)
  } catch(err) {
    console.log(err);
    res.status(500).send('Something wrong with DB / Cannot get Industries');
  }
});

router.get('/timezones', async (req, res) => {
  try {
    const timezones = await Timezones.find({});
    res.send(timezones)
  } catch(err) {
      console.log(err);
      res.status(500).send('Something wrong with DB / Cannot get Timezones');
  }
});

router.put('/languages/:id', upload.fields([{name: "flag"}]), async (req, res) => {
  const { active, icon } = req.body;
  const flag = req.files["flag"];
  const { id }= req.params;
  const isActive = active ? true : false;
  try {
    await updateLanguage({id, icon, isActive, flag});
    res.send('Updated');
  } catch(err) {
    console.log(err);
    res.status(500).send('Something went wrong while Language saving');
  }
});

router.get('/countries', (req, res) => {
  try {
    const countries = getAllCountries();
    res.send(countries);
  } catch(err) {
    console.log(err)
    res.status(500).send("Error on getting countries");
  }
});

router.get('/leadsources', async (req, res) => {
  try {
    const leadsources = await LeadSource.find({});
    leadsources.sort((a, b) => {
        if(a.source > b.source) return 1;
        if(a.source < b.source) return -1;
      });
    res.send(leadsources);
  } catch(err) {
    console.log(err);
    res.status(500).send("Error on getting lead sources from DB")
  }
});

router.post('/leadsource', async (req, res) => {
  const { leadSource } = req.body;
  try {
    if(leadSource._id) {
      await LeadSource.updateOne({"_id": leadSource._id}, leadSource);
      return res.send("Updated");
    }
    await LeadSource.create(leadSource);
    res.send("New lead source created");
  } catch(err) {
    console.log(err);
    res.status(500).send("Error on updating/creating a lead source")
  }
});

router.delete('/leadsource/:id', async (req, res) => {
  const { id } = req.params;
  if(!id) {
    return res.send('Deleted unsaved lead source')
  }
  try {
    await LeadSource.deleteOne({"_id": id});
    res.send('Deleted');
  } catch(err) {
    console.log(err);
    res.status(500).send("Error on deleting lead source");
  }
});

router.get('/groups', async (req, res) => {
    try {
      const groups = await Group.find({});
      groups.sort((a, b) => {
          if(a.name > b.name) return 1;
          if(a.name < b.name) return -1;
        });
      res.send(groups);
    } catch(err) {
      console.log(err);
      res.status(500).send("Error on getting groups from DB")
    }
});

router.post('/group', async (req, res) => {
    const { group } = req.body;
    try {
        if(group._id) {
        await Group.updateOne({"_id": group._id}, group);
        return res.send("Updated");
        }
        await Group.create(group);
        res.send("New group created");
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on updating/creating a group")
    }
});

router.delete('/group/:id', async (req, res) => {
    const { id } = req.params;
    if(!id) {
        return res.send('Deleted unsaved group')
    }
    try {
        await Group.deleteOne({"_id": id});
        res.send('Deleted');
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on deleting group");
    }
});

router.get('/group-user', async (req, res) => {
    const { id } = req.query;
    try {
        const user = await User.findOne({group: id},{firstName: 1});
        res.send(user);
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on getting any user of group");
    }
})

router.get('/steps', async (req, res) => {
    try {
      const steps = await Step.find({});
      res.send(steps);
    } catch(err) {
      console.log(err);
      res.status(500).send("Error on getting steps from DB")
    }
});
  
router.post('/step', async (req, res) => {
    const { step } = req.body;
    try {
      if(step._id) {
        await Step.updateOne({"_id": step._id}, step);
        return res.send('Updated');
      }
      await Step.create(step);
      res.send('New step saved.');
    } catch(err) {
      console.log(err);
      res.status(500).send("Error on updating/creating a step")
    }
});

router.get('/packages', async (req, res) => {
  try {
    const packages = await Package.find({});
    res.send(packages);
  } catch(err) {
    console.log(err);
    res.status(500).send("Error on getting packages from DB")
  }
});

router.post('/package', async (req, res) => {
  const { package } = req.body;
  try {
    if(package._id) {
      await Package.updateOne({"_id": package._id}, package);
      return res.send('Updated');
    }
    await Package.create(package);
    res.send('New package saved.');
  } catch(err) {
    console.log(err);
    res.status(500).send("Error on updating/creating a package")
  }
});

router.delete('/package/:id', async (req, res) => {
  const { id } = req.params;
  try {
    if(!id) {
      return res.send("Deleted unsaved package");
    }
    await Package.deleteOne({"_id": id});
    res.send("Package deleted");
  } catch(err) {
    console.log(err);
    res.status(500).send("Error on deleting package")
  }
});

router.get('/instructions', async (req, res) => {
    try {
        const instructions = await Instruction.find({});
        res.send(instructions);
    } catch(err) {
        console.log(err);   
        res.status(500).send("Error on getting instructions from DB")
    }
})

router.post('/instructions', async (req, res) => {
    const { instruction } = req.body;
    try {
        if(instruction._id) {
            await Instruction.updateOne({"_id": instruction._id}, instruction);
            return res.send('Updated');
        }
        await Instruction.create(instruction);
        res.send('New instruction saved.');
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on updating/creating a instruction")
    }
  });
  
router.delete('/instructions/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await Instruction.deleteOne({"_id": id});
        res.send("Package deleted");
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on deleting instruction")
    }
});

router.get('/reasons', async (req, res) => {
    try {
      const reasons = await CancelReason.find({});
      reasons.sort((a, b) => {
          if(a.reason > b.reason) return 1;
          if(a.reason < b.reason) return -1;
        });
      res.send(reasons);
    } catch(err) {
      console.log(err);
      res.status(500).send("Error on getting reasons from DB")
    }
});
  
router.post('/reason', async (req, res) => {
    const { reason } = req.body;
    try {
      if(reason._id) {
        await CancelReason.updateOne({"_id": reason._id}, {...reason});
        return res.send("Updated");
      }
      await CancelReason.create(reason);
      res.send("New reason created");
    } catch(err) {
      console.log(err);
      res.status(500).send("Error on updating/creating a reason")
    }
});
  
router.delete('/reason/:id', async (req, res) => {
    const { id } = req.params;
    if(!id) {
      return res.send('Deleted unsaved reason')
    }
    try {
      await CancelReason.deleteOne({"_id": id});
      res.send('Deleted');
    } catch(err) {
      console.log(err);
      res.status(500).send("Error on deleting reason");
    }
});

router.get('/discount-charts', async (req, res) => {
    try {
      const charts = await DiscountChart.find({});
      charts.sort((a, b) => {
          if(a.name > b.name) return 1;
          if(a.name < b.name) return -1;
        });
      res.send(charts);
    } catch(err) {
      console.log(err);
      res.status(500).send("Error on getting discount charts from DB")
    }
});

router.get('/chart', async (req, res) => {
    const { name } = req.query;
    try {
        const chart = await DiscountChart.findOne({name});
        res.send(chart);
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on getting chart by name");
    }
})

router.get('/tier-lqas', async (req, res) => {
    try {
        const result = await TierLqa.find();
        res.send(result);
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on getting tier lqas");
    }
})

router.get('/pdf-file', async (req, res) => {
    try {
        const result = await getPdf();
        res.send(result);
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on getting tier lqas");
    }
})

router.get('/units', async (req, res) => {
  try {
    const units = await getUnits();
    console.log(units);
    res.send(units);
  } catch (err) {
    console.log(err);
    res.status(500).send('Error on getting units');
  }
})

module.exports = router;
