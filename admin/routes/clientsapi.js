const router = require('express').Router();
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const unirest = require('unirest');
const querystring = require('querystring');
const fs = require('fs');
const mv = require('mv');
const { sendMail } = require('../utils/mailhandler');
const { sendMailClient } = require('../utils/mailhandlerclient');
const { sendMailPortal } = require('../utils/mailhandlerportal')
const { Clients, Projects, Languages, Services, Industries } = require('../models');
const { quote, project } = require('../models/xtrf');
const reqq = require('request');
const fileType = require('file-type');
const http = require('http');
const writeFile = require('write');

router.get('/client', (req, res) => {
    let id = req.query.id;
    Clients.find({"_id": id})
        .then(result => {
            let client = result[0];
            res.send(client)
        })
        .catch(err => {
            console.log(err)
        })
})

router.post('/client-rates', async (req, res) => {
    var rate = req.body;
    let id = rate.client;
    let client = await Clients.find({"_id": id});
    for(let comb of client[0].languageCombinations) {
      if(comb.service == rate.title && comb.source.lang == rate.sourceLanguage.lang &&
        comb.target.lang == rate.targetLanguage.lang) {
          comb.rate = rate.industry[0].rate;
      }
    }
    
    Clients.updateOne({"_id": id}, {$set: {languageCombinations: client[0].languageCombinations}})
      .then(result => {
        res.send('rates changed')
    })
      .catch(err => {
        console.log(err);
    })
})

router.post('/update-client', async (req, res) => {
    let client = req.body;
    Clients.update({"_id": client._id}, client)
    .then(result => {
        res.send('Client updated')
    })
    .catch(err => {
        console.log(err)
    })
})

module.exports = router;
