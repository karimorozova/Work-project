const router = require('express').Router();
const multer = require('multer');
const mv = require('mv');
const { getVendor, getVendors, checkRates, deleteRate } = require('./vendors/');
const { vendorMail } = require('../utils/mailtovendor');
const { Vendors, Projects, User, Languages, Services, Industries } = require('../models');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './dist/uploads/')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
});

var upload = multer({
    storage: storage,
    limits: {fieldSize: 25 * 1024 * 1024}
});


function moveFile(oldFile, vendorId) {

var newFile = './dist/vendorsDocs/' + vendorId + '/' + oldFile.filename;

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

router.post('/mailtovendors', async (req, res) => {
    let vendors = req.body;
    try {
        for(let vend of vendors) {
            const vendor = await getVendor({"_id": vend._id});
            await vendorMail(vendor);
        }
        res.send('All messages were sent')
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on sending email to Vendors");
    }
})

router.get('/get-rates', async (req, res) => {
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
    var rate = req.body;
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
        const result = await checkRates(vendor, industries, rate);
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
        let vendor = await getVendor({"_id": vendorId})
        for(let comb of langCombs) {
            let langPairExist = false;
            for(let venComb of vendor.languageCombinations) {
                if(comb.source.lang == venComb.source.lang && comb.target.lang == venComb.target.lang
                    && comb.service.title == venComb.service.title) {
                    for(let indus of comb.industry) {
                        let industryExist = false;
                        for(let ind of venComb.industry) {
                            if(ind.name == indus.name) {
                                ind.rate = indus.rate;
                                industryExist = true;
                            }
                        }
                        if(!industryExist) {
                            venComb.industry.push(indus);
                        }
                    }
                    langPairExist = true;                
                }
            }
            if(!langPairExist) {
                vendor.languageCombinations.push(comb);
                await Vendors.updateOne({"_id": vendorId}, {$set: {languageCombinations: vendor.languageCombinations}})
            } else {
                await Vendors.updateOne({"_id": vendorId}, {$set: {languageCombinations: vendor.languageCombinations}})
            }
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

router.get('/accept-step', async (req, res) => {
    res.send('Step is accepted')
})

router.get('/decline-step', async (req, res) => {
    res.send('Step is rejected')
})

module.exports = router;
