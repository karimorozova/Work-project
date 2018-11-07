const router = require('express').Router();
const { upload, stepEmailToVendor } = require('../utils');
const mv = require('mv');
const { updateProject, getProject } = require('../projects');
const { getVendor, getVendors, checkRatesMatch, deleteRate, addVendorsSeveralLangs } = require('./vendors');
const { Vendors, Projects, User, Languages, Services, Industries } = require('../models');

function moveFile(oldFile, vendorId) {

let newFile = './dist/vendorsDocs/' + vendorId + '/' + oldFile.filename;

mv(oldFile.path, newFile, {
        mkdirp: true
    }, function (err) {
});

return oldFile.filename;
}

router.get('/vendor', async (req, res) => {
    const id = req.query.id;
    try {
        const vendor = await getVendor({"_id": id});
        res.send(vendor)
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on getting Vendors");
    }
})

router.post('/step-email', async (req, res) => {
    const { projectId, step } = req.body;
    try {
        const project = await getProject({"_id": projectId});
        const stepsAfterMailSent = await stepEmailToVendor(project, step);
        await updateProject({"_id": projectId}, {steps: stepsAfterMailSent});
        res.send('Email has been sent')
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on sending email to Vendor");
    }
})

router.get('/rates', async (req, res) => {
    const { vendorId, service, form } = req.query;
    try {
        const vendor = await getVendor({"_id": vendorId});
        let rates = [];
        for(let comb of vendor.languageCombinations) {
            if(comb.service.title === service) {
                for(let elem of comb.industry) {
                    let industry = {...elem.industry._doc};
                    industry.rate = elem.rate;
                    industry.active = elem.active;
                    if(form === "Duo") {
                        rates.push({
                            id: comb.id,
                            service: comb.service,
                            sourceLanguage: comb.source,
                            targetLanguage: comb.target,
                            industry: [industry]
                        })
                    } else {
                        industry.package = elem.package;
                        rates.push({
                            id: comb.id,
                            service: comb.service,
                            targetLanguage: comb.target,
                            industry: [industry]
                        })
                    }
                    
                }
            }
        }
        res.send(rates);
    } catch(err) {
        console.log(err);
        res.status(500).send('Error on getting Vendor rates');
    }
})

router.post('/vendor-rates', async (req, res) => {
    let rate = req.body;
    const id = rate.vendor;
    try {
        let vendor = await getVendor({"_id": id})
        for(let indus of rate.industry) {
            for(let ind of vendor.industry) {
                if(ind.id === indus._id || indus.name == "All") {
                    ind.rate = indus.rate;
                    ind.active = indus.active;
                    if(rate.form === "Mono") {
                        ind.package = indus.package;
                    }
                }
            }
        }
        const industries = vendor.industry.map(item => {
            const active = item.rate > 0;
            if(rate.form === 'Duo') {
                return {industry: item.id, active: active, rate: item.rate}
            }
            return {industry: item.id, active: active, rate: item.rate, package: item.package}
        })
        const result = await checkRatesMatch(vendor, industries, rate);
        res.send('rates changed');
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on updating rates of Vendor");
    }
})

router.delete('/rate/:id', async (req,res) => {
    let  { vendorId, industry } = req.body;
    const { id } = req.params;
    if(id === "undefined") {
        return res.send("Deleted");
    }
    try {
        let vendor = await getVendor({"_id": vendorId})
        const result = await deleteRate(vendor, industry, id);
        res.send('rate deleted');
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on deleting rates of Vendor");
    }
})

router.post('/several-langs', async (req, res) => {
    const vendorId = req.body.vendor;
    let langCombs = JSON.parse(req.body.langs);
    try {
        let vendor = await getVendor({"_id": vendorId});
        const vendorCombinations = vendor.languageCombinations.filter(item => {
            return item.source;
        }) 
        for(let comb of langCombs) {
            await addVendorsSeveralLangs({
                vendorId: vendorId,
                comb: comb,
                vendorCombinations: vendorCombinations,
                langPairs: vendor.languagePairs
            })
        }
        res.send('Several langs added..')
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on adding several langs for Vendor");
    }
})

router.post('/new-vendor', upload.fields([{ name: 'photo' }]), async (req, res) => {
    let vendor = JSON.parse(req.body.vendor);
    const photoFile = req.files["photo"];
    try {
        const saveVendor = await Vendors.create(vendor);
        const id = saveVendor.id;
        if(photoFile) {
            await moveFile(photoFile[0], id)
            vendor.photo = `/vendorsDocs/${id}/${photoFile[0].filename}`;
        }
        await Vendors.update({"_id": id}, vendor);
        res.send({id: id})
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on creating Vendor");
    }
})

router.post('/update-vendor', upload.fields([{ name: 'photo' }]), async (req, res) => {
    let vendor = JSON.parse(req.body.vendor);
    const photoFile = req.files["photo"];
    try {
        if(photoFile) {
            await moveFile(photoFile[0], vendor._id);
            vendor.photo = `/vendorsDocs/${vendor._id}/${photoFile[0].filename}`;
        }
        await Vendors.updateOne({"_id": vendor._id}, vendor);
        res.send('Vendor info updated')
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on updating Vendor");
    }
})

router.post('/deletevendor', async (req, res) => {
    try { 
        await Vendors.deleteOne({"_id": req.body.id});
        res.send('Deleted');
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on deleting Vendor");
    }
})

router.get('/step-decision', async (req, res) => {
    const { decision, vendorId, projectId, taskId, stepName, to } = req.query;
    const date = Date.now();
    try {
        if((date - +to) > 900000) {
            res.set('Content-Type', 'text/html')
            res.send(`<body onload="javascript:setTimeout('self.close()',5000);"><p>Sorry! The link is already expired.</p></body>`)
        } else {
            const project = await Projects.findOne({"_id": projectId});
            const steps = [...project.steps];
            let index = steps.findIndex(item => item.name === stepName && +item.taskId === +taskId);
            if(steps[index].vendorsClickedOffer.indexOf(vendorId) !== -1) {
                res.set('Content-Type', 'text/html');
                return res.send(`<body onload="javascript:setTimeout('self.close()',5000);"><p>Sorry. You've already made your decision.</p></body>`)
            }
            steps[index].status = (decision === "accept") ? "Accepted" : "Rejected";
            steps[index].vendorsClickedOffer.push(vendorId);
            await Projects.updateOne({"_id": projectId}, {steps: steps});
            res.set('Content-Type', 'text/html')
            res.send(`<body onload="javascript:setTimeout('self.close()',5000);"><p>Thank you.</p></body>`)
        }
    } catch(err) {
        console.log(err);
        res.set('Content-Type', 'text/html')
        res.send(`<body onload="javascript:setTimeout('self.close()',5000);"><p>Sorry. Acception failed! Try again later.</p></body>`)
    }
})

module.exports = router;
