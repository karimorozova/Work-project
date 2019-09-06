const router = require('express').Router();
const fs = require('fs');
const https = require('https');
const jwt = require("jsonwebtoken");
const { checkClientContact } = require('../middleware');
const { getClient } = require('../clients');
const { getService } = require('../services');
const { getProject, getProjects, updateProjectStatus, getDeliverablesLink } = require("../projects/");
const { createRequest, storeRequestFiles, getClientRequests } = require("../clientRequests");
const { getAfterTaskStatusUpdate } = require('../clients');
const { Clients } = require('../models');
const { secretKey } = require('../configs');
const { upload } = require('../utils/');
const { setClientsContactNewPassword } = require('../users');

router.post("/auth", async (req, res, next) => {
  if (req.body.logemail && req.body.logpassword) {
    Clients.authenticate(req.body.logemail, req.body.logpassword, async (error, data) => {
      if (error || !data) {
        let err = new Error();
        err.status = 401;
        res.status(401).send("Wrong email or password.");
      } else {
        try {
          const clientToken = await jwt.sign({clientId: data.client.id, contactEmail: data.contact.email}, secretKey, { expiresIn: '2h'});
          res.statusCode = 200;
          res.send({ clientToken });
        } catch(err) {
          console.log(err);
          res.status(500).send("Server Error. Try again later.");
        }
      }
    });
  } else {
    let err = new Error();
    err.status = 400;
    res.status(400).send("All fields required.");
  }
});

router.post("/reset-pass", async (req, res) => {
    const { email } = req.body;
    try {
        const client = await Clients.findOne({"contacts.email": email});
        if(!client) {
            return res.status(400).send("No such user"); 
        }
        await setClientsContactNewPassword(client, email);
        return res.send("new password sent");
    } catch(err) {
        console.log(err);
        res.status(500).send("Server error. Try again later.");
    }
})

router.get('/projects', checkClientContact, async (req, res) => {
    const { token } = req.query;
    try {
        const verificationResult = jwt.verify(token, secretKey);
        const client = await getClient({"_id": verificationResult.clientId})
        const projects = await getProjects({"customer": verificationResult.clientId});
        const requests = await getClientRequests({"customer": verificationResult.clientId});
        const user = client.contacts.find(item => item.email === verificationResult.contactEmail);
        res.send({client, user, projects, requests});
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on getting Projects.");
    }
})

router.get('/language-combinations', checkClientContact, async (req, res) => {
    let id = +req.query.customerId;
    try {
        let result = await customer.languageComb(id);
        let languages = result.data;
        res.send(languages);
    } catch(err) {
        console.log(err);
        res.status(500).send('Error on getting language combinations');
    }
});

router.get('/request-service', checkClientContact, async (req, res) => {
    const { symbol } = req.query;
    try {
        const service = await getService({symbol});
        res.send(service);
    } catch(err) {
        console.log(err);
        res.status(500).send('Error on getting request service');
    }
})

router.get('/default-source', checkClientContact, async (req, res) => {
    const tokenHeader = req.headers['token-header'];
    const { ratesProp } = req.query;
    try {
        const verificationResult = jwt.verify(tokenHeader, secretKey);
        const client = await getClient({"_id": verificationResult.clientId});
        const english = client[ratesProp].find(item => item.source.symbol === 'EN-GB');
        const source = english ? english.source : "";
        res.send({source});
    } catch(err) {
        console.log(err);
        res.status(500).send('Error on setting default source language');
    }
})

router.get('/customer-info', checkClientContact, async (req, res) => {
    try {
        res.send(customer)
    } catch(err) {
        console.log(err);
        res.status(500).send('Error on getting customer info');
    }
});

router.get('/clientinfo', checkClientContact, async (req, res) => {
    try {
        const { token } = req.query;
        const verificationResult = jwt.verify(token, secretKey);
        const client = await getClient({"_id": verificationResult.clientId});
        const user = client.contacts.find((contact) => contact.email === verificationResult.contactEmail);
        res.send({client, user});
    } catch(err) {
        console.log(err);
        res.status(500).send('Error on getting clientinfo');
    }
});

router.get('/projectFiles', checkClientContact, async (request, res) => {
    let options = {
        hostname: 'pangea.s.xtrf.eu',
        path: `/customer-api/projects/${request.query.projectId}/files/outputFilesAsZip`,
        method: 'GET',
        headers: {
            'Cookie': `JSESSIONID=${request.cookies.ses}`,
        }
    };
    try {
        let wstream = fs.createWriteStream(`./dist/project${request.query.projectId}.zip`);
        let req = await https.request(options, (resp) => {

            resp.pipe(wstream);
        });
        req.end();
        wstream.on('finish', () => {
            res.send('File created!')
        })
    } catch(err) {
        console.log(err);
        res.status(500).send('Error on getting project files');
    }
});

router.get('/downloadProject', checkClientContact, (req, res) => {
    res.send(`https://admin.pangea.global/project${req.query.projectId}.zip`);
});

router.get('/deleteZip', (req, res) => {
    let fileName = 'project';
    let fileId = req.query.projectId;
    try {
        if (req.query.taskId) {
            fileName = 'task';
            fileId = req.query.taskId;
        }
        setTimeout(() => {
            fs.unlink(`./dist/${fileName}${fileId}.zip`, (err) => console.log(err));
        }, 6000);
        res.send('Deleted');
    } catch(err) {
        console.log(err);
        res.status(500).send('Error on deleting file');
    }
});

router.get('/taskFiles', checkClientContact, async (request, res) => {
    let options = {
        hostname: 'pangea.s.xtrf.eu',
        path: `/customer-api/projects/tasks/${request.query.taskId}/files/outputFilesAsZip`,
        method: 'GET',
        headers: {
            'Cookie': `JSESSIONID=${request.cookies.ses}`,
        }
    };
    try {
        let wstream = fs.createWriteStream(`./dist/task${request.query.taskId}.zip`);
        let req = await https.request(options, (resp) => {
            resp.pipe(wstream);
        });

        req.end();
        wstream.on('finish', () => {
            res.send('File created!')
        })
    } catch(err) {
        console.log(err);
        res.status(500).send('Error on getting task files');
    }
});

router.get('/downloadTask', checkClientContact, (req, res) => {
    res.send(`https://admin.pangea.global/task${req.query.taskId}.zip`);
});

router.post('/approve-reject', checkClientContact, async (req, res) => {
    const { quote, key } = req.body;
    try {
        let status = 'Rejected';
        if(key === 'approve') {
            status = quote.isStartAccepted ? 'Started' : "Approved";
        }
        const updatedQuote = await updateProjectStatus(quote._id, status);
        res.send(updatedQuote);
    } catch(err) {
        console.log(err);
        res.status(500).send('Error on approving');
    }
});

router.get('/reject', checkClientContact, async (req, res) => {
    const id = req.query.quoteId;
    try {
        const result = await customer.quoteReject(id);
        res.send("rejected");
    } catch(err) {
        console.log(err);
        res.status(500).send('Error on rejecting');
    }
});

router.post('/request', checkClientContact, upload.fields([{ name: 'detailFiles' }, { name: 'refFiles' }]),async (req, res) => {
    let {source, targets, quoteDecision, xtmCustomerId, ...request } = req.body;
    try {
        const sourceLanguage = JSON.parse(source);
        const targetLanguages = JSON.parse(targets);
        let createdRequest = await createRequest({...request, sourceLanguage, targetLanguages});
        const { detailFiles: sourceFiles, refFiles } = req.files;
        createdRequest.sourceFiles = await storeRequestFiles(sourceFiles, createdRequest.id);
        createdRequest.refFiles = refFiles ? await storeRequestFiles(refFiles, createdRequest.id) : [];
        createdRequest.save();
        res.send(createdRequest);
    } catch(err) {
        console.log(err);
        res.status(500).send('Error on creating a request!');
    }
});

router.get('/deliverables', checkClientContact, async (req, res) => {
    const { taskId } = req.query;
    try {
        const project = await getProject({"tasks.taskId": taskId});
        const task = project.tasks.find(item => item.taskId === taskId);
        const link = await getDeliverablesLink({taskId, projectId: project.id, jobs: task.xtmJobs});
        res.send({link});
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on downloading deliverables");
    }
})

router.post('/task-status', checkClientContact, async (req, res) => {
    const { task, status } = req.body;
    try {
        const project = await getProject({"tasks.taskId": task.taskId});
        const updatedProject = await getAfterTaskStatusUpdate({task, project, status});
        res.send(updatedProject);
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on Project status update");
    }
})

module.exports = router;
