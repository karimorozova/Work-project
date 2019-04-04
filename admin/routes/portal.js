const { ClientApi, HomeApi } = require('../models/xtrf');
const { getClient } = require('../clients');
const { jobInfo, quoteTasksInfo } = require('../models/xtrf/report');
const router = require('express').Router();
const fs = require('fs');
const https = require('https');
const { Clients, Projects } = require('../models');
const { secretKey } = require('../configs');
const jwt = require("jsonwebtoken");

router.get('/', (req, res) => {
    res.send("portal");
});

router.post("/auth", async (req, res, next) => {
  if (req.body.logemail) {
    Clients.authenticate(req.body.logemail, req.body.logpassword, async (error, data) => {
      if (error || !data) {
        let err = new Error('Wrong email or password.');
        err.status = 401;
        res.status(401).send("Wrong email or password.");
      } else {
        try {
          const jsession = await jwt.sign({clientId: data.client._id, contactEmail: data.contact.email}, secretKey, { expiresIn: '2h'});
          res.statusCode = 200;
          res.send({ jsession });
        } catch(err) {
          console.log(err);
          res.status(500).send("Server Error. Try again later.");
        }
      }
    });
  } else {
    let err = new Error('All fields required.');
    err.status = 400;
    res.status(400).send("All fields required.");
  }
});

router.get('/language-combinations', async (req, res) => {
    let customer = new ClientApi("", req.cookies.ses);
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

router.get('/customer-info', async (req, res) => {
    try {
        let customer = await HomeApi.customerInfo(req.query.customerId);
        res.send(customer)
    } catch(err) {
        console.log(err);
        res.status(500).send('Error on getting customer info');
    }
});

router.get('/clientinfo', async (req, res) => {
    try {
        const { token } = req.query;
        const verificationResult = jwt.verify(token, secretKey);
        const client = await getClient({"_id": verificationResult.clientId});
        const user = client.contacts.find((contact)=>contact.email === verificationResult.contactEmail);
        res.send({client, user});
    } catch(err) {
        console.log(err);
        res.status(500).send('Error on getting clientinfo');
    }
});

router.get('/projectFiles', async (request, res) => {
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

router.get('/downloadProject', (req, res) => {
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

router.get('/taskFiles', async (request, res) => {
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

router.get('/downloadTask', (req, res) => {
    res.send(`https://admin.pangea.global/task${req.query.taskId}.zip`);
});

router.get('/job',async (req, res) => {
    const id = req.query.projectId;
    try {
    const jobById = await jobInfo(id);
    res.send({jobById});
    } catch(err) {
        console.log(err);
        res.status(500).send('Error on getting job information');
    }
});

router.get('/tasksInfo', async (req,res) => {
    const id = req.query.quoteId;
    try {
        const tasksOfQuote = await quoteTasksInfo(id);
        res.send({tasksOfQuote});
    } catch(err) {
        console.log(err);
        res.status(500).send('Error on getting task information');
    }
});

router.get('/approve', async (req, res) => {
    const customer = new ClientApi("", req.cookies.ses);
    const id = req.query.quoteId;
    try {
        const result = await customer.quoteApprove(id);
        res.send("approved");
    } catch(err) {
        console.log(err);
        res.status(500).send('Error on approving');
    }
});

router.get('/reject', async (req, res) => {
    const customer = new ClientApi("", req.cookies.ses);
    const id = req.query.quoteId;
    try {
        const result = await customer.quoteReject(id);
        res.send("rejected");
    } catch(err) {
        console.log(err);
        res.status(500).send('Error on rejecting');
    }
});

router.post('/request', async (req, res) => {
  console.log('req:', req.body);
  // let project = {...req.body};
  // project.projectManager = req.session.userId;
  // let todayStart = new Date();
  // todayStart.setUTCHours(0,0,0,0);
  // let todayEnd = new Date(todayStart);
  // todayEnd.setUTCHours(23,59,59,0);
  // try {
  //   const todaysProjects = await Projects.find({"createdAt" : { $gte : todayStart, $lt: todayEnd }});
  //   const nextNumber = (todaysProjects.length < 10) ? '[0' + (todaysProjects.length + 1) + ']': '[' + (todaysProjects.length + 1) + ']';
  //   project.status = "Requested";
  //   project.projectId = req.body.dateFormatted + ' ' + nextNumber;
  //   const newProject = await Projects.create(project);
  //   const result = await getProject({"_id": newProject.id});
  //   res.send(result);
  // } catch(err) {
  //   console.log(err);
  //   res.status(500).send('Error on creating a project!');
  // }
});


module.exports = router;
