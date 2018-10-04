const router = require('express').Router();
const multer = require('multer');
const fs = require('fs');
const fse = require('fs-extra');
const mv = require('mv');
const { clientMail } = require('../utils/mailtoclients');
const { pmMail } = require('../utils/mailtopm');
const { Clients, Projects, User, Languages, Services, Industries } = require('../models');

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

router.get('/client', async (req, res) => {
    let id = req.query.id;
    try {
        const client = await Clients.findOne({"_id": id}).populate('industry');
        res.send(client);
    }  catch(err) {
            console.log(err);
            res.status(500).send("Error on getting Client " + err);
        }
})

router.get('/clients-every', async (req,res) => {
    try {
        const clients = await Clients.find({}).populate('industry');
        res.send(clients);
    }  catch(err) {
            console.log(err);
            res.status(500).send("Error on getting Client " + err);
        }
})

router.post('/mailtoclient', async (req, res) => {
    const project = req.body;
    try {
        const client = await Clients.findOne({"_id": project.customer}).populate('industry');
        await clientMail(project, client);
        console.log('email to client');
        res.send('An email to Cilent sent!')
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on mailing to Client " + err);
    }
})

router.get('/acceptquote', async (req, res) => {
    const mailDate = req.query.to;
    const date = new Date().getTime();
    const expiry = date - mailDate;
    try {
        if(expiry > 60000) {
            res.set('Content-Type', 'text/html');
            res.send(`<body onload="javascript:setTimeout('self.close()',5000);"><p>Sorry! The link is already expired.</p></body>`)
        } else {
            const projectId = req.query.project;
            await Projects.updateOne({"_id": projectId}, {$set: {status: 'Accepted'}});
            res.set('Content-Type', 'text/html')
            res.send("Thank you!")
        }
    } catch(err) {
            console.log(err);
            res.set('Content-Type', 'text/html')
            res.send(`<body onload="javascript:setTimeout('self.close()',5000);"><p>Sorry. Acception failed! Try again later.</p></body>`)
        }    
})

router.get('/declinequote', async (req, res) => {
    const mailDate = req.query.to;
    const date = new Date().getTime();
    const expiry = date - mailDate;
    try {
        if(expiry > 60000) {
            res.set('Content-Type', 'text/html')
            res.send(`<body onload="javascript:setTimeout('self.close()',5000);"><p>Sorry! The link is already expired.</p></body>`)
        } else {
            const projectId = req.query.project;
            const project = await Projects.findOne({"_id": projectId});
            const client = await Clients.findOne({"_id": project[0].customer});
            const user = await User.findOne({"username": client[0].projectManager});
            pmMail(project, client, user);
            res.set('Content-Type', 'text/html')
            res.send(`<body onload="javascript:setTimeout('self.close()',5000);"><p>Thank you! We'll contact you if any changes.</p></body>`)
        }
    } catch(err) {
        console.log(err);
        res.set('Content-Type', 'text/html')
        res.send(`<body onload="javascript:setTimeout('self.close()',5000);"><p>Sorry. Try again later.</p></body>`)
    }
})

router.post('/client-rates', async (req, res) => {
    let rate = req.body;
    const id = rate.client;
    try {
        let client = await Clients.findOne({"_id": id}).populate('industry');
        for(let indus of rate.industry) {
            for(let ind of client[0].industry) {
                if(ind.name == indus.name || indus.name == "All") {
                    ind.rate = indus.rate;
                }
            }
        }
        let industries = JSON.stringify(client[0].industry);
        industries = JSON.parse(industries);
        let exist = false;
        if(client[0].languageCombinations.length) {
            for(let comb of client[0].languageCombinations) {
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
        if(!exist || !client.languageCombinations.length) {
            client.languageCombinations.push({
                source: rate.sourceLanguage,
                target: rate.targetLanguage,
                service: rate.service,
                industry: industries,
                active: true
            })
        }
        await Clients.updateOne({"_id": id}, {$set: {languageCombinations: client.languageCombinations}});
        res.send('rates changed')
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on updating rates of Client " + err);
    }
})

router.post('/several-langs', async (req, res) => {
    const clientId = req.body.client;
    let langCombs = JSON.parse(req.body.langs);
    try {
        let client = await Clients.findOne({"_id": clientId}).populate('industry');
        for(let comb of langCombs) {
            let langPairExist = false;
            for(let clientComb of client.languageCombinations) {
                if(comb.source.lang == clientComb.source.lang && comb.target.lang == clientComb.target.lang
                    && comb.service.title == clientComb.service.title) {
                    for(let indus of comb.industry) {
                        let industryExist = false;
                        for(let ind of clientComb.industry) {
                            if(ind.name == indus.name) {
                                ind.rate = indus.rate;
                                industryExist = true;
                            }
                        }
                        if(!industryExist) {
                            clientComb.industry.push(indus);
                        }
                    }
                    langPairExist = true;                
                }
            }
            if(!langPairExist) {
                client.languageCombinations.push(comb);
                let result = await Clients.updateOne({"_id": clientId}, {$set: {languageCombinations: client.languageCombinations}})
            } else {
                let result = await Clients.updateOne({"_id": clientId}, {$set: {languageCombinations: client.languageCombinations}})
            }
        }
        res.send('Several langs added..');
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on adding several languages for Client " + err);
    }
})

router.post('/delete-duorate', async (req, res) => {
    var rate = req.body;
    const id = rate.client;
    try {
        let client = await Clients.findOne({"_id": id}).populate('industry');
        let allZero = [];
        for(let i = 0; i < client.languageCombinations.length; i++) {
            if(client.languageCombinations[i].service.title == rate.service.title && client[0].languageCombinations[i].source.lang == rate.sourceLanguage.lang &&
                client.languageCombinations[i].target.lang == rate.targetLanguage.lang) {
                for(let ind of client.languageCombinations[i].industry) {
                    for(let indus of rate.industry) {
                        if(ind.name == indus.name) {
                            ind.rate = 0;
                        }
                    }
                    allZero.push(ind.rate);
                }
                let sum = allZero.reduce( (x,y) => x + y);
                if(!sum) {
                    client[0].languageCombinations.splice(i, 1);
                    break;
                }
            }
        }
        await Clients.updateOne({"_id": id}, {$set: {languageCombinations: client.languageCombinations}});
        res.send('rate deleted')
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on deleting rates of Client " + err);
    }
})

router.post('/update-client', upload.any(), async (req, res) => {
    let client = JSON.parse(req.body.client);
    let clientId;
    try {
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
                            await fs.unlink('./dist' + contact.photo, (err) => {
                                console.log(err)
                            })
                        }
                        await movePhoto(photo, clientId, contact);
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
                await fs.unlink('./dist' + client.contract, (err) => {
                    console.log(err)
                })
            }
            await moveNdaCont(contract, clientId, "contract");
            client.contract = '/clientsDocs/' + clientId + '/contract/' + contract.filename;
        }

        let nda = req.files.find(item => {
            return item.fieldname == 'nda'
        })
        if(nda) {
            if(client.nda) {
                await fs.unlink('./dist' + client.nda, (err) => {
                    console.log(err)
                })
            }
            await moveNdaCont(nda, clientId, "nda");
            client.nda = '/clientsDocs/' + clientId + '/nda/' + nda.filename;
        }

        await Clients.updateOne({"_id": clientId}, client);
        res.send({id: clientId})
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on updating/creating Client " + err);
    }
})

router.get('/get-contract', async (req, res) => {
    const path = req.query.path;
    res.send(`http://localhost:3001${path}`);
})

router.get('/get-nda', async (req, res) => {
    const path = req.query.path;
    res.send(`http://localhost:3001${path}`);
})

router.post('/deleteclient', async (req, res) => {
    try {
        await fse.remove('./dist/clientsDocs/' + req.body.id, (err) => {
            console.log(err)
        })
        await Clients.deleteOne({"_id": req.body.id});
        res.send('Deleted')
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on deleting Client " + err);
    }
})

router.post('/deleteContact', async (req, res) => {
    try {
        await Clients.updateOne({"_id": req.body.id}, {contacts: req.body.contacts})
        res.send('Deleted')
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on deleting contact of Client " + err);
    }
})

module.exports = router;
