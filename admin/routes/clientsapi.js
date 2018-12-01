const router = require('express').Router();
const { upload, clientMail, pmMail } = require('../utils/');
const fs = require('fs');
const apiUrl = require('../helpers/apiurl');
const fse = require('fs-extra');
const mv = require('mv');
const { getClient, getClients, getClientRates, updateClientRates, getAfterUpdate, deleteRate, addClientsSeveralLangs} = require('../clients/');
const { Clients, Projects, User } = require('../models');
const { getProject } = require('../projects');
const { emitter } = require('../events');

function movePhoto(oldFile, clientId, contact) {
const newFile = './dist/clientsDocs/' + clientId + '/contacts/' + contact.name + '-' + contact.surname + oldFile.filename;
mv(oldFile.path, newFile, {
        mkdirp: true
    }, function (err) {
        console.log(err);
});

return oldFile.filename;
}

function moveNdaCont(oldFile, clientId, ndaCont) {
const newFile = './dist/clientsDocs/' + clientId + `/${ndaCont}/` + oldFile.filename;
mv(oldFile.path, newFile, {
        mkdirp: true
    }, function (err) {
        console.log(err);
});

return oldFile.filename;
}

router.get('/client', async (req, res) => {
    let { id } = req.query;
    try {
        const client = await getClient({"_id": id})
        res.send(client);
    }  catch(err) {
            console.log(err);
            res.status(500).send("Error on getting Client");
        }
})

router.get('/clients-every', async (req,res) => {
    try {
        const clients = await getClients({});
        res.send(clients);
    }  catch(err) {
            console.log(err);
            res.status(500).send("Error on getting Client");
        }
})

router.post('/mailtoclient', async (req, res) => {
    const project = req.body;
    try {
        const client = await getClient({"_id": project.customer});
        await clientMail(project, client);
        res.send('An email to Cilent sent!')
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on mailing to Client");
    }
})

router.get('/acceptquote', async (req, res) => {
    const mailDate = req.query.to;
    const date = new Date().getTime();
    const expiry = date - mailDate;
    const projectId = req.query.projectId;
    try {
        if(expiry > 900000) {
            res.set('Content-Type', 'text/html');
            res.send(`<body onload="javascript:setTimeout('self.close()',5000);"><p>Sorry! The link is already expired.</p></body>`)
        } else {
            const project = await getProject({"_id": projectId});
            if(project.isClientOfferClicked) {
                res.set('Content-Type', 'text/html');
                return res.send(`<body onload="javascript:setTimeout('self.close()',5000);"><p>Sorry. You've already made your decision.</p></body>`)
            }
            await Projects.updateOne({"_id": projectId}, {$set: {status: 'Started', isClientOfferClicked: true}});
            emitter.emit('managersNotificationEmail', project);
            res.set('Content-Type', 'text/html')
            res.send(`<body onload="javascript:setTimeout('self.close()',5000);"><p>Thank you. We'll contact you as soon as possible.</p></body>`)
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
    const projectId = req.query.projectId;
    try {
        if(expiry > 900000) {
            res.set('Content-Type', 'text/html')
            res.send(`<body onload="javascript:setTimeout('self.close()',5000);"><p>Sorry! The link is already expired.</p></body>`)
        } else {
            const project = await getProject({"_id": projectId});
            if(project.isClientOfferClicked) {
                res.set('Content-Type', 'text/html');
                return res.send(`<body onload="javascript:setTimeout('self.close()',5000);"><p>Sorry. You've already made your decision.</p></body>`)
            }
            const client = {...project.customer._doc, id: project.customer.id};
            const user = await User.findOne({"_id": client.projectManager._id});
            await pmMail(project, client, user);
            await Projects.updateOne({"_id": projectId}, {$set: {status: "Rejected", isClientOfferClicked: true}});
            res.set('Content-Type', 'text/html')
            res.send(`<body onload="javascript:setTimeout('self.close()',5000);"><p>Thank you! We'll contact you if any changes.</p></body>`)
        }
    } catch(err) {
        console.log(err);
        res.set('Content-Type', 'text/html')
        res.send(`<body onload="javascript:setTimeout('self.close()',5000);"><p>Sorry. Try again later.</p></body>`)
    }
})

router.get('/rates', async (req, res) => {
    const { clientId, form } = req.query;
    try {
        let client = await getClient({"_id": clientId});
        const rates = await getClientRates({client, form});
        res.send(rates);
    } catch(err) {
        console.log(err);
        res.status(500).send('Error on getting Client rates');
    }
})

router.post('/rates', async (req, res) => {
    const { ratesInfo } = req.body;
    try {
        const updatedClient = await updateClientRates(ratesInfo);
        res.send(updatedClient);
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on updating rates of Client");
    }
})

router.delete('/rate/:id', async (req, res) => {
    const deleteInfo = {...req.body};
    const { id } = req.params;
    if(id === "undefined") {
        return res.send("Deleted");
    }
    try {
        const updatedClient = await deleteRate(deleteInfo, id);
        res.send(updatedClient);
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on deleting rates of Client");
    }
})

router.post('/several-langs', async (req, res) => {
    const clientId = req.body.client;
    let langCombs = JSON.parse(req.body.langs);
    try {
        let client = await getClient({"_id": clientId});
        const clientCombinations = client.languageCombinations.filter(item => {
            return item.source
        }) 
        for(let comb of langCombs) {
            await addClientsSeveralLangs({
                clientId: clientId,
                comb: comb,
                clientCombinations: clientCombinations,
                industry: client.industry
            })
        }
        const updatedClient = await getClient({"_id": clientId});
        res.send(updatedClient);
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on adding several languages for Client");
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
        const result = await getAfterUpdate({"_id": clientId}, client);
        res.send({client: result})
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on updating/creating Client");
    }
})

router.get('/get-contract', async (req, res) => {
    const path = req.query.path;
    res.send(`${apiUrl}${path}`);
})

router.get('/get-nda', async (req, res) => {
    const path = req.query.path;
    res.send(`${apiUrl}${path}`);
})

router.delete('/deleteclient/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await fse.remove('./dist/clientsDocs/' + id, (err) => {
            console.log(err);
        })
        await Clients.deleteOne({"_id": id});
        res.send('Deleted')
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on deleting Client");
    }
})

router.post('/deleteContact', async (req, res) => {
    const { id, contacts } = req.body;
    try {
        const result = await getAfterUpdate({"_id": id}, {contacts: contacts})
        res.send({updatedClient: result})
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on deleting contact of Client");
    }
})

router.post('/update-matrix', async (req, res) => {
    const { id, matrix } = req.body;
    try {
        const result = await getAfterUpdate({"_id": id}, {matrix: matrix});
        res.send({updatedClient: result});
    } catch(err) {
        res.status(500).send("Error on updating matrix");
    }
})

module.exports = router;
