const router = require('express').Router();
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const unirest = require('unirest');
const querystring = require('querystring');
const fs = require('fs');
const fse = require('fs-extra');
const mv = require('mv');
const { sendMail } = require('../utils/mailhandler');
const { clientMail } = require('../utils/mailtoclients');
const { pmMail } = require('../utils/mailtopm');
const { Clients, Projects, User, Languages, Services, Industries } = require('../models');
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
    storage: storage,
    limits: {fieldSize: 25 * 1024 * 1024}
});


function movePhoto(oldFile, clientId, contact) {

var newFile = './dist/clientsDocs/' + clientId + '/contacts/' + contact.name + '-' + contact.surname + oldFile.filename;

mv(oldFile.path, newFile, {
        mkdirp: true
    }, function (err) {
});

return oldFile.filename;
}

function moveNdaCont(oldFile, clientId, ndaCont) {

var newFile = './dist/clientsDocs/' + clientId + `/${ndaCont}/` + oldFile.filename;

mv(oldFile.path, newFile, {
        mkdirp: true
    }, function (err) {
});

return oldFile.filename;
}

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

router.get('/clients-every', (req,res) => {
    Clients.find()
    .then(clients => {
        res.send(clients)
    })
    .catch(err => {
        console.log(err)
    })
})

router.post('/mailtoclient', async (req, res) => {
    let project = req.body;
    let client = await Clients.find({"_id": project.customer});
    clientMail(project, client[0]);
})

router.get('/acceptquote', async (req, res) => {
    let mailDate = req.query.to;
    let date = new Date().getTime();
    let expiry = date - mailDate;
    if(expiry > 60000) {
        res.send("Sorry! The link is already expired.")
    } else {
        let projectId = req.query.project;
        Projects.update({"_id": projectId}, {$set: {status: 'Accepted'}})
        .then(result => {
            res.send("Thank you!")
        })
        .catch(err => {
            console.log(err);
            res.send('Sorry. Acception failed! Try again later.')
        })
    }
    
})

router.get('/declinequote', async (req, res) => {
    let mailDate = req.query.to;
    let date = new Date().getTime();
    let expiry = date - mailDate;
    if(expiry > 60000) {
        res.send("Sorry! The link is already expired.")
    } else {
        let projectId = req.query.project;
        let project = await Projects.find({"_id": projectId});
        let client = await Clients.find({"_id": project[0].customer});
        let user = await User.find({"username": client[0].projectManager})
        pmMail(project[0], client[0], user[0]);
        res.send("Thank you! We'll contact you if any changes.")
    } 
})

router.post('/client-rates', async (req, res) => {
    var rate = req.body;
    let id = rate.client;
    let client = await Clients.find({"_id": id});
    let exist = false;
    for(let comb of client[0].languageCombinations) {
      if(comb.service == rate.title && comb.source.lang == rate.sourceLanguage.lang &&
        comb.target.lang == rate.targetLanguage.lang) {
          comb.rate = rate.industry[0].rate;
          exist = true;
      }
    }
    if(!exist) {
        client[0].languageCombinations.push({
            source: rate.sourceLanguage,
            target: rate.targetLanguage,
            service: rate.title,
            rate: rate.industry[0].rate,
            active: true
        })
    }
    Clients.updateOne({"_id": id}, {$set: {languageCombinations: client[0].languageCombinations}})
      .then(result => {
        res.send('rates changed')
    })
      .catch(err => {
        console.log(err);
    })
})

// router.post('/new-client', upload.any(), async (req, res) => {
//     let client = JSON.parse(req.body.client);
//     let result = await Clients.create(client);
//     console.log(result.id);
// })

router.post('/update-client', upload.any(), async (req, res) => {
    let client = JSON.parse(req.body.client);
    let clientId;
    if(!client._id) {
        let result = await Clients.create(client);
        clientId = result.id;
    } else {
        clientId = client._id;
    }
    const contacts = client.contacts;
    const photoFiles = req.files.filter(item =>{
        return item.fieldname == 'photos'
    });

    if(photoFiles.length) {
        for(let photo of photoFiles) {
            for(let contact of contacts) {
                if(contact.file && photo.filename == contact.file) {
                    if(contact.photo) {
                        fs.unlink('./dist' + contact.photo, (err) => {
                            console.log(err)
                        })
                    }
                    movePhoto(photo, clientId, contact);
                    contact.photo = `/clientsDocs/${clientId}/contacts/${contact.name}-${contact.surname}${photo.filename}`;
                    contact.file = null;
                }
            }
        }
        client.contacts = contacts;
    }

    let contract = req.files.find(item => {
        return item.fieldname == 'contract'
    })
    if(contract) {
        if(client.contract) {
            fs.unlink('./dist' + client.contract, (err) => {
                console.log(err)
            })
        }
        moveNdaCont(contract, clientId, "contract");
        client.contract = '/clientsDocs/' + clientId + '/contract/' + contract.filename;
    }

    let nda = req.files.find(item => {
        return item.fieldname == 'nda'
    })
    if(nda) {
        if(client.nda) {
            fs.unlink('./dist' + client.nda, (err) => {
                console.log(err)
            })
        }
        moveNdaCont(nda, clientId, "nda");
        client.nda = '/clientsDocs/' + clientId + '/nda/' + nda.filename;
    }

    Clients.update({"_id": clientId}, client)
    .then(result => {
        res.send({id: clientId})
    })
    .catch(err => {
        console.log(err)
    })
})

router.get('/get-contract', async (req, res) => {
    let path = req.query.path;
    res.send(`http://localhost:3001${path}`);
})

router.get('/get-nda', async (req, res) => {
    let path = req.query.path;
    res.send(`http://localhost:3001${path}`);
})

router.post('/deleteclient', async (req, res) => {
    fse.remove('./dist/clientsDocs/' + req.body.id, (err) => {
        console.log(err)
    })
    Clients.deleteOne({"_id": req.body.id})
    .then(result => {
        console.log(result);
        res.send('Deleted')
    })
    .catch(err => {
        console.log(err)
    })
})

router.post('/deleteContact', async (req, res) => {
    Clients.update({"_id": req.body.id}, {contacts: req.body.contacts})
    .then(result => {
        console.log(result)
        res.send('Deleted')
    })
    .catch(err => {
        console.log(err)
    })
})

module.exports = router;
