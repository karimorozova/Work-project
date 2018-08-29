const router = require('express').Router();
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const unirest = require('unirest');
const querystring = require('querystring');
const fs = require('fs');
const mv = require('mv');
const { sendMail } = require('../utils/mailhandler');
const { clientMail } = require('../utils/mailtoclients');
const { pmMail } = require('../utils/mailtopm');
const { Vendors, Projects, User, Languages, Services, Industries } = require('../models');
const { quote, project } = require('../models/xtrf');
const reqq = require('request');
const fileType = require('file-type');
const http = require('http');
const writeFile = require('write');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './dist/uploads/')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
});

var upload = multer({
    storage: storage
});


function moveFile(oldFile, vendorId) {

var newFile = './dist/static/vendors/' + vendorId + '/' + oldFile.filename;

mv(oldFile.path, newFile, {
        mkdirp: true
    }, function (err) {
});

return oldFile.filename;
}

router.get('/vendor', (req, res) => {
    let id = req.query.id;
    Vendors.find({"_id": id})
        .then(result => {
            let vendor = result[0];
            res.send(vendor)
        })
        .catch(err => {
            console.log(err)
        })
})

router.post('/delete-duorate', async (req,res) => {
    var rate = req.body;
    let id = rate.vendor;
    let vendor = await Vendors.find({"_id": id});
    let allZero = [];
    for(let i = 0; i < vendor[0].languageCombinations.length; i++) {
        let comb = vendor[0].languageCombinations[i];
        if(comb.service.title == rate.service.title && comb.source.lang == rate.sourceLanguage.lang &&
            comb.target.lang == rate.targetLanguage.lang) {
            for(let ind of comb.industry) {
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
    Vendors.updateOne({"_id": id}, {$set: {languageCombinations: vendor[0].languageCombinations}})
      .then(result => {
        res.send('rate deleted')
    })
      .catch(err => {
        console.log(err);
    })
})

router.post('/vendor-rates', async (req, res) => {
    var rate = req.body;
    let id = rate.vendor;
    let vendor = await Vendors.find({"_id": id});
    for(let indus of rate.industry) {
        for(let ind of vendor[0].industry) {
            if(ind.name == indus.name || indus.name == "All") {
                ind.rate = indus.rate;
            }
        }
    }
    let industries = JSON.stringify(vendor[0].industry);
    industries = JSON.parse(industries);
    let exist = false;
    if(vendor[0].languageCombinations.length) {
        for(let comb of vendor[0].languageCombinations) {
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
    if(!exist || !vendor[0].languageCombinations.length) {
        vendor[0].languageCombinations.push({
            source: rate.sourceLanguage,
            target: rate.targetLanguage,
            service: rate.service,
            industry: industries,
            active: true
        })
    }
    Vendors.updateOne({"_id": id}, {$set: {languageCombinations: vendor[0].languageCombinations}})
      .then(result => {
        res.send('rates changed')
    })
      .catch(err => {
        console.log(err);
    })
})

router.post('/new-vendor', upload.fields([{ name: 'photo' }]), async (req, res) => {
    let vendor = JSON.parse(req.body.vendor);
    const photoFile = req.files["photo"];
    let saveVendor = await Vendors.create(vendor);
    let id = saveVendor.id;
    if(photoFile) {
        moveFile(photoFile[0], id)
        vendor.photo = `/static/vendors/${id}/${photoFile[0].filename}`;
    }
    let updateVendor = await Vendors.update({"_id": id}, vendor);
    res.send({id: id})
    // Vendors.create(vendor)
    // .then(result => {
    //     res.send(result)
    // })
    // .catch(err => {
    //     console.log(err)
    // })
})

router.post('/update-vendor', upload.fields([{ name: 'photo' }]), async (req, res) => {
    let vendor = JSON.parse(req.body.vendor);
    const photoFile = req.files["photo"];
    if(photoFile) {
        moveFile(photoFile[0], vendor._id);
        vendor.photo = `/static/vendors/${vendor._id}/${photoFile[0].filename}`;
    }
    let saveVendor = await Vendors.update({"_id": vendor._id}, vendor);
    res.send('Vendor info updated')
})

router.post('/deletevendor', async (req, res) => {
    Vendors.deleteOne({"_id": req.body.id})
    .then(result => {
        console.log(result)
        res.send('Deleted')
    })
    .catch(err => {
        console.log(err)
    })
})


module.exports = router;
