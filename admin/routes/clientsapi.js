const router = require('express').Router();
const { upload, clientMail } = require('../utils');
const apiUrl = require('../helpers/apiurl');
const fse = require('fs-extra');
const { getClient, getClients, updateClientRates, getClientAfterUpdate, importRates, updateClientInfo, getClientAfterCombinationsUpdated} = require('../clients');
const { Clients } = require('../models');
const { getProject } = require('../projects');
const { getClientRequest } = require('../clientRequests');

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

router.post('/rates', async (req, res) => {
    const { clientId, ...rateInfo } = req.body;
    try {
        const client = await getClient({"_id": clientId});
        const updatedClient = await updateClientRates(client, rateInfo);
        res.send(updatedClient);
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on updating rates of Client");
    }
})

router.post('/remove-rate', async (req, res) => {
    const { clientId, rateId, prop } = req.body;
    try {
        const updatedClient = await getClientAfterUpdate({"_id": clientId}, {
            $pull: {[prop]: {'_id': rateId}}    
        })
        res.send(updatedClient);
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on deleting rate of Client");
    }
})

router.post('/remove-rates', async (req, res) => {
    const { clientId, checkedIds, prop } = req.body;
    try {
        const updatedClient = await getClientAfterUpdate({"_id": clientId}, {
            $pull: {[prop]: {'_id': {$in: checkedIds}}}    
        })
        res.send(updatedClient);
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on deleting rate of Client");
    }
})

router.post('/combination', async (req, res) => {
    const { step, rate } = req.body;
    try {
        const project = await getProject({"steps._id": step._id});
        const updatedClient = await getClientAfterCombinationsUpdated({project, step, rate});
        res.send(updatedClient);
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on adding combination for Client");
    }
})

router.post('/import-rates', async (req, res) => {
    const { clientId, ratesData, prop } = req.body;
    try {
        const updatedClient = await importRates({clientId, ratesData, prop});
        res.send(updatedClient);
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on importing rates to Client");
    }
})

router.get("/unique-email", async (req, res) => {
    const { email } = req.query;
    try {
        const client = await Clients.findOne({"contacts.email": email});
        if(client) {
            return res.send("exist");
        }
        res.send("");
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on checking Client's contact email uniqueness.")
    }
})

router.post('/update-client', upload.any(), async (req, res) => {
    let client = JSON.parse(req.body.client);
    let clientId = client._id;
    try {
        if(!client._id) {
            let result = await Clients.create(client);
            clientId = result.id;
        }
        const result = await updateClientInfo({clientId, client, files: req.files});
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
        const result = await getClientAfterUpdate({"_id": id}, {contacts: contacts})
        res.send({updatedClient: result})
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on deleting contact of Client");
    }
})

router.post('/update-matrix', async (req, res) => {
    const { id, matrix } = req.body;
    try {
        const result = await getClientAfterUpdate({"_id": id}, {matrix: matrix});
        res.send({updatedClient: result});
    } catch(err) {
        res.status(500).send("Error on updating matrix");
    }
})
router.get('/any-doc', async (req, res) => {
    const { id } = req.query;
    try {
        const request = await getClientRequest({"customer": id});
        if(request) {
            return res.send(request);
        }
        const project = await getProject({"customer": id});
        res.send(project);
    } catch(err) {
        res.status(500).send("Error on getting any document of client");
    }
})

router.post('/update-client-status', async (req, res) => {
    const { id, isTest } = req.body    
    try {
       await Clients.updateOne({"_id": id}, {"isTest": isTest});
       const client = await getClient({"_id": id})
       res.send(client);
    } catch (err) {
        console.log(err);
        res.status(500).send("Error on updating Client status");
    }
})

module.exports = router;
