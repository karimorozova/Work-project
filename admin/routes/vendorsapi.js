const router = require('express').Router();
const multer = require('multer');
const mv = require('mv');
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
        const vendor = await Vendors.findOne({"_id": id})
                .populate('industry')
                .populate('native')
                .populate('languageCombinations.source')
                .populate('languageCombinations.target')
                .populate('languagePairs.source')
                .populate('languagePairs.target')
                .populate('languageCombinations.service')
                .populate('languageCombinations.industry.industry');
                res.send(vendor)
        } catch(err) {
            console.log(err);
            res.status(500).send("Error on getting Vendors " + err);
        }
})

router.post('/mailtovendors', async (req, res) => {
    let vendors = req.body;
    try {
        for(let vend of vendors) {
            const vendor = await Vendors.findOne({"_id": vend._id})
                    .populate('industry')
                    .populate('native')
                    .populate('languageCombinations.source')
                    .populate('languageCombinations.target')
                    .populate('languagePairs.source')
                    .populate('languagePairs.target')
                    .populate('languageCombinations.service')
                    .populate('languageCombinations.industry.industry');
            await vendorMail(vendor);    
        }
        res.send('All messages were sent')
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on sending email to Vendors " + err);
    }
})

router.get('/get-rates', async (req, res) => {
    const vendorId = req.query.id;
    const service = req.query.service;
    const form = req.query.form;
    try {
        const vendor = await Vendors.findOne({"_id": vendorId})
                .populate('industry')
                .populate('languageCombinations.source')
                .populate('languageCombinations.target')
                .populate('languageCombinations.service')
                .populate('languageCombinations.industry.industry');
        let rates = [];
        for(let comb of vendor.languageCombinations) {
            if(comb.service.title === service) {
                for(let elem of comb.industry) {
                    elem.industry.active = elem.active;
                    elem.industry.rate = elem.rate;
                    if(form === "Duo") {
                        rates.push({
                            service: comb.service,
                            sourceLanguage: comb.source,
                            targetLanguage: comb.target,
                            industry: [elem.industry]
                        })
                    } else {
                        elem.industry.package = elem.package;
                        rates.push({
                            service: comb.service,
                            targetLanguage: comb.target,
                            industry: [elem.industry]
                        })
                    }
                    
                }
            }
        }
        res.send(rates);
    } catch(err) {
        console.log(err);
        res.status(500).send('Error on getting Client rates ' + err);
    }
})

router.post('/delete-duorate', async (req,res) => {
    var rate = req.body;
    const id = rate.vendor;
    try {
        let vendor = await Vendors.findOne({"_id": id})
                .populate('industry')
                .populate('native')
                .populate('languageCombinations.source')
                .populate('languageCombinations.target')
                .populate('languagePairs.source')
                .populate('languagePairs.target')
                .populate('languageCombinations.service')
                .populate('languageCombinations.industry.industry');
        let allZero = [];
        for(let i = 0; i < vendor.languageCombinations.length; i++) {
            if(vendor.languageCombinations[i].service.title == rate.service.title && vendor.languageCombinations[i].source.lang == rate.sourceLanguage.lang &&
                vendor.languageCombinations[i].target.lang == rate.targetLanguage.lang) {
                for(let ind of vendor.languageCombinations[i].industry) {
                    for(let indus of rate.industry) {
                        if(ind.name == indus.name) {
                            ind.rate = 0;
                        }
                    }
                    allZero.push(ind.rate);
                }
                let sum = allZero.reduce( (x,y) => x + y);
                if(!sum) {
                    vendor[0].languageCombinations.splice(i, 1);
                    break;
                }
            }
        }
        await Vendors.updateOne({"_id": id}, {$set: {languageCombinations: vendor.languageCombinations}})
        res.send('rate deleted')
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on deleting rate of Vendor " + err);
    }
})

router.post('/vendor-rates', async (req, res) => {
    var rate = req.body;
    const id = rate.vendor;
    try {
        let vendor = await Vendors.findOne({"_id": id})
                .populate('industry')
                .populate('native')
                .populate('languageCombinations.source')
                .populate('languageCombinations.target')
                .populate('languagePairs.source')
                .populate('languagePairs.target')
                .populate('languageCombinations.service')
                .populate('languageCombinations.industry.industry');
        for(let indus of rate.industry) {
            for(let ind of vendor.industry) {
                if(ind.name == indus.name || indus.name == "All") {
                    ind.rate = indus.rate;
                }
            }
        }
        let industries = JSON.stringify(vendor.industry);
        industries = JSON.parse(industries);
        let exist = false;
        if(vendor.languageCombinations.length) {
            for(let comb of vendor.languageCombinations) {
                if(comb.service.title == rate.service.title && comb.source.lang == rate.sourceLanguage.lang &&
                    comb.target.lang == rate.targetLanguage.lang) {
                    for(let ind of comb.industry) {
                        for(let indus of rate.industry) {
                            if(ind.name == indus.name || indus.name == "All") {
                                comb.industry = industries;
                            }
                        }
                    }
                    exist = true;
                }
            }
        }
        if(!exist || !vendor.languageCombinations.length) {
            vendor.languageCombinations.push({
                source: rate.sourceLanguage,
                target: rate.targetLanguage,
                service: rate.service,
                industry: industries,
                active: true
            })
        }
        await Vendors.updateOne({"_id": id}, {$set: {languageCombinations: vendor.languageCombinations}})
        res.send('rates changed')
    }
      catch(err) {
        console.log(err);
        res.status(500).send("Error on updating rates of Vendor " + err);
    }
})

router.post('/several-langs', async (req, res) => {
    const vendorId = req.body.vendor;
    let langCombs = JSON.parse(req.body.langs);
    try {
        let vendor = await Vendors.findOne({"_id": vendorId})
                .populate('industry')
                .populate('native')
                .populate('languageCombinations.source')
                .populate('languageCombinations.target')
                .populate('languagePairs.source')
                .populate('languagePairs.target')
                .populate('languageCombinations.service')
                .populate('languageCombinations.industry.industry');
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
        res.status(500).send("Error on adding several langs for Vendor " + err);
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
        res.status(500).send("Error on creating Vendor " + err);
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
        res.status(500).send("Error on updating Vendor " + err);
    }
})

router.post('/deletevendor', async (req, res) => {
    try { 
        await Vendors.deleteOne({"_id": req.body.id});
        res.send('Deleted');
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on deleting Vendor " + err);
    }
})


module.exports = router;
