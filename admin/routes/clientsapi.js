const router = require('express').Router();
const { upload, clientMail } = require('../utils');
const apiUrl = require('../helpers/apiurl');
const fse = require('fs-extra');
const {
  getClient,
  getClients,
  updateClientRates,
  getClientAfterUpdate,
  importRates,
  updateClientInfo,
  getClientAfterCombinationsUpdated,
  updateClientService,
  deleteClientService,
  updateRates,
  saveClientDocumentDefault,
  saveClientDocument,
  removeClientDoc,
} = require('../clients');
const { getRatePricelist, changeClientPricelist, bindClientRates, getClientRates } = require('../rates');
const { Clients } = require('../models');
const { getProject } = require('../projects');
const { getClientRequest } = require('../clientRequests');

router.get('/client', async (req, res) => {
  let { id } = req.query;
  try {
    const client = await getClient({ "_id": id });
    res.send(client);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error on getting Client");
  }
});

router.get('/clients-every', async (req, res) => {
  try {
    const clients = await getClients({});
    res.send(clients);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error on getting Client");
  }
});

router.post('/combination', async (req, res) => {
  const { step, rate } = req.body;
  try {
    const project = await getProject({ "steps._id": step._id });
    const updatedClient = await getClientAfterCombinationsUpdated({ project, step, rate });
    res.send(updatedClient);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error on adding combination for Client");
  }
});

router.post('/import-rates', async (req, res) => {
  const { clientId, ratesData, prop } = req.body;
  try {
    const updatedClient = await importRates({ clientId, ratesData, prop });
    res.send(updatedClient);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error on importing rates to Client");
  }
});

router.get("/unique-email", async (req, res) => {
  const { email } = req.query;
  try {
    const client = await Clients.findOne({ "contacts.email": email });
    if (client) {
      return res.send("exist");
    }
    res.send("");
  } catch (err) {
    console.log(err);
    res.status(500).send("Error on checking Client's contact email uniqueness.");
  }
});

router.post('/update-client', upload.any(), async (req, res) => {
  let client = JSON.parse(req.body.client);
  let clientId = client._id;
  try {
    if (!client._id) {
      let result = await Clients.create(client);
      clientId = result.id;
    }
    const result = await updateClientInfo({ clientId, client, files: req.files });
    res.send({ client: result });
  } catch (err) {
    console.log(err);
    res.status(500).send("Error on updating/creating Client");
  }
});

router.get('/get-contract', async (req, res) => {
  const { path } = req.query;
  try {
    res.send(`${apiUrl}${path}`);
  } catch (err) {
    console.log(err);
    res.status(500).send('Error on getting contract');
  }
});

router.get('/get-nda', async (req, res) => {
  const { path } = req.query;
  try {
    res.send(`${apiUrl}${path}`);
  } catch (err) {
    console.log(err);
    res.status(500).send('Error on getting NDA');
  }
});

router.delete('/deleteclient/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await fse.remove('./dist/clientsDocs/' + id, (err) => {
      console.log(err);
    });
    await Clients.deleteOne({ "_id": id });
    res.send('Deleted');
  } catch (err) {
    console.log(err);
    res.status(500).send("Error on deleting Client");
  }
});

router.post('/deleteContact', async (req, res) => {
  const { id, contacts } = req.body;
  try {
    const result = await getClientAfterUpdate({ "_id": id }, { contacts: contacts });
    res.send({ updatedClient: result });
  } catch (err) {
    console.log(err);
    res.status(500).send("Error on deleting contact of Client");
  }
});

router.post('/update-matrix', async (req, res) => {
  const { id, matrix } = req.body;
  try {
    const result = await getClientAfterUpdate({ "_id": id }, { matrix: matrix });
    res.send({ updatedClient: result });
  } catch (err) {
    res.status(500).send("Error on updating matrix");
  }
});
router.get('/any-doc', async (req, res) => {
  const { id } = req.query;
  try {
    const request = await getClientRequest({ "customer": id });
    if (request) {
      return res.send(request);
    }
    const project = await getProject({ "customer": id });
    res.send(project);
  } catch (err) {
    res.status(500).send("Error on getting any document of client");
  }
});

router.post('/update-client-status', async (req, res) => {
  const { id, isTest } = req.body;
  try {
    await Clients.updateOne({ "_id": id }, { "isTest": isTest });
    const client = await getClient({ "_id": id });
    res.send(client);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error on updating Client status");
  }
});

router.get('/rates/:id', async (req, res) => {
  const { id: clientId } = req.params;
  try {
    const { rates } = await getClientRates({ _id: clientId });
    res.send(rates);
  } catch (err) {
    console.log(err);
    res.status(500).send('Error on getting client rates');
  }
});

router.post('/rates/:id', async (req, res) => {
  const { id: clientId } = req.params;
  const { itemIdentifier, updatedItem } = req.body;
  try {
    await updateClientRates(clientId, itemIdentifier, updatedItem);
    res.send('Updated');
  } catch (err) {
    console.log(err);
    res.status(500).send('Error on editing client rates');
  }
});

router.post('/rates/bind-rates', async (req, res) => {
  const { id: clientId } = req.params;
  const { defaultPricelistId, objToBind, key } = req.body;
  try {
    await bindClientRates(clientId, defaultPricelistId, objToBind, key);
  } catch (err) {
    console.log(err);
    res.status(500).send('Error on binding multipliers');
  }
});

router.post('/rates', async (req, res) => {
  const { oldMultiplier, key } = req.body;
  try {
    await updateRates(key, oldMultiplier);
    res.send('Saved');
  } catch (err) {
    console.log(err);
    res.status(500).send('Error on updating rates');
  }
});

router.post('/rates/change-pricelist/:id', async (req, res) => {
  const { id: clientId } = req.params;
  try {
    await changeClientPricelist(clientId, req.body);
    res.send('Saved');
  } catch (err) {
    console.log(err);
    res.status(500).send('Error on changing pricelist');
  }
});

router.post('/rates/sync-cost/:id', async (req, res) => {
  const { id: clientId } = req.params;
  const { tableKey, row } = req.body;
  try {
    await syncClientRatesCost(clientId, tableKey, row);
    res.send('Synced');
  } catch (err) {
    console.log(err);
    res.status(500).send('Error on syncing client\'s rates');
  }
});

router.post('/rates/rate-combinations/:id', async (req, res) => {
  const { id: clientId } = req.params;
  try {
    const ratePricelist = await getRatePricelist(clientId, req.body);
    res.send(ratePricelist);
  } catch (err) {
    console.log(err);
    res.status(500).send('Error on getting client rate\'s combinations');
  }
});

router.post('/services', async (req, res) => {
  const { clientId, currentData, oldData } = req.body;
  try {
    await updateClientService(clientId, currentData, oldData);
    res.send('Updated');
  } catch (err) {
    console.log(err);
    res.status(500).send('Error on saving Client services');
  }
});

router.delete('/services/:clientId/:serviceId', async (req, res) => {
  const { clientId, serviceId } = req.params;
  try {
    await deleteClientService(clientId, serviceId);
    res.send('Deleted');
  } catch (err) {
    console.log(err);
    res.status(500).send('Error on deleting Client services');
  }
});

router.post('/client-document-default', async (req, res) => {
  const { clientId, category } = req.body;
  try {
    const updatedClient = await saveClientDocumentDefault({
      clientId, category
    });
    res.send(updatedClient);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error on adding client documents");
  }
});

router.post('/client-document', upload.fields([{ name: 'documentFile' }]), async (req, res) => {
  const { clientId, category, oldFilePath, oldName, oldCategory } = req.body;
  const files = req.files["documentFile"] || [];
  try {
    const updatedClient = await saveClientDocument({
      clientId, file: files[0], category, oldFilePath, oldName, oldCategory
    });
    res.send(updatedClient);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error on adding client document");
  }
});

router.post('/remove-client-doc', async (req, res) => {
  const { clientId, docFile } = req.body;
  try {
    const updatedVendor = await removeClientDoc({
      clientId, ...docFile
    });
    res.send(updatedVendor);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error on removing client document");
  }
});

module.exports = router;
