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

router.get('/vendors-every', (req,res) => {
    Vendors.find()
    .then(vendors => {
        res.send(vendors)
    })
    .catch(err => {
        console.log(err)
    })
})

router.post('/vendor-rates', async (req, res) => {
    var rate = req.body;
    let id = rate.vendor;
    let vendor = await Vendors.find({"_id": id});
    for(let indus of rate.industry) {
        for(let ind of vendor[0].industries) {
            if(ind.name == indus.name) {
                ind.rate == indus.rate;
            }
        }
    }
    let exist = false;
    for(let comb of vendor[0].languageCombinations) {
      if(comb.service == rate.title && comb.source.lang == rate.sourceLanguage.lang &&
        comb.target.lang == rate.targetLanguage.lang) {
          comb.rate = rate.industry[0].rate;
          exist = true;
      }
    }
    if(!exist) {
        vendor[0].languageCombinations.push({
            source: rate.sourceLanguage,
            target: rate.targetLanguage,
            service: rate.title,
            rate: rate.industry[0].rate,
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

router.post('/new-vendor', async (req, res) => {
    let vendor = req.body;
    Vendors.create(vendor)
    .then(result => {
        res.send('New vendor saved')
    })
    .catch(err => {
        console.log(err)
    })
})

router.post('/update-vendor', async (req, res) => {
    let vendor = req.body;
    Vendors.update({"_id": vendor._id}, vendor)
    .then(result => {
        res.send('Vendor updated')
    })
    .catch(err => {
        console.log(err)
    })
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
