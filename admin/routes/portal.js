const router = require('express').Router();
const fs = require('fs');
const jwt = require("jsonwebtoken");
const { checkClientContact } = require('../middleware');
const { getClient } = require('../clients');
const { getService } = require('../services');
const { getProject, getProjects, updateProjectStatusForClientPortalProject,
  // getDeliverablesLink
} = require("../projects/");
const { getProjectDeliverables } = require('../projects/files');
const { createRequest, storeRequestFiles, getClientRequests, updateClientRequest, clientRequestNotification, notifyRequestCancelled } = require('../clientRequests');
const { getAfterTaskStatusUpdate } = require('../clients');
const { getMemoqProjectsForClientPortal } = require('../services/memoqs/otherProjects');
const { Clients, Projects, Languages } = require('../models');
const { secretKey } = require('../configs');
const { upload } = require('../utils/');
const { setClientsContactNewPassword, updateAccountDetails } = require('../users');

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

router.post("/account-details", checkClientContact,  upload.fields([{ name: 'photo' }]), async (req, res) => {
    const accountData = req.body;
    try {
        const verificationResult = jwt.verify(accountData.token, secretKey);
        let client = await getClient({"_id": verificationResult.clientId});
        const userIndex = client.contacts.findIndex(item => item.email === verificationResult.contactEmail);
        const photoFile = req.files['photo'] ? req.files['photo'][0] : null;
        const updatedUser = await updateAccountDetails({
            user: client.contacts[userIndex]._doc, clientId: client.id, accountData, photoFile
        });
        client.contacts[userIndex] = updatedUser;
        client.save();
        res.send({user: updatedUser});
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on saving account info");
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
        res.status(500).send("Error on checking client contact's email uniqueness.")
    }
})

router.post("/reset-pass", async (req, res) => {
    const { email } = req.body;
    try {
        const client = await Clients.findOne({"contacts.email": email});
        if(!client) {
            return res.status(400).send("No such user");
        }
        await setClientsContactNewPassword(client, email);
        res.send("new password sent");
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on reseting password. Try again later.");
    }
})

router.get('/projects', checkClientContact, async (req, res) => {
    const { token } = req.query;
    try {
      const verificationResult = jwt.verify(token, secretKey);
      const client = await getClient({ '_id': verificationResult.clientId });
      const projects = await getProjects({ $and: [{ status: { $nin: ['Draft', 'Cost Quote'] } }, { 'customer': verificationResult.clientId }] });

      //Not Delete this section
      // const memoqProjects = await getMemoqProjectsForClientPortal(
      //   { $and: [{ customer: verificationResult.clientId }, { status: { $ne: null } }] }
      // );

      const requests = await getClientRequests({
        'customer': verificationResult.clientId,
        status: { $ne: 'Cancelled' }
      });
      const languages = await Languages.find();
      const user = client.contacts.find(item => item.email === verificationResult.contactEmail);
      res.send({ client, user, projects, memoqProjects: [], requests, languages });
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

// router.get('/projectFiles', checkClientContact, async (req, res) => {
//     res.send('ok');
// });
// router.get('/deleteZip', (req, res) => {
//     let fileName = 'project';
//     let fileId = req.query.projectId;
//     try {
//         if (req.query.taskId) {
//             fileName = 'task';
//             fileId = req.query.taskId;
//         }
//         setTimeout(() => {
//             fs.unlink(`./dist/${fileName}${fileId}.zip`, (err) => console.log(err));
//         }, 6000);
//         res.send('Deleted');
//     } catch(err) {
//         console.log(err);
//         res.status(500).send('Error on deleting file');
//     }
// });

router.post('/approve-reject', checkClientContact, async (req, res) => {
    const { quote, key } = req.body;
    try {
        const updatedQuote = await updateProjectStatusForClientPortalProject(quote._id, key);
        res.send(updatedQuote);
    } catch(err) {
        console.log(err);
        res.status(500).send('Error on approving');
    }
});

router.get('/reject', checkClientContact, async (req, res) => {
    const id = req.query.quoteId;
    try {
        await customer.quoteReject(id);
        res.send("rejected");
    } catch(err) {
        console.log(err);
        res.status(500).send('Error on rejecting');
    }
});

// router.post('/request', checkClientContact, upload.fields([{ name: 'detailFiles' }, { name: 'refFiles' }]),async (req, res) => {
//     const { ...request } = req.body;
//     try {
//         let createdRequest = await createRequest(request);
//         const { detailFiles: sourceFiles, refFiles } = req.files;
//         if(sourceFiles) {
//             createdRequest.sourceFiles = await storeRequestFiles(sourceFiles, createdRequest.id);
//         }
//         if(refFiles) {
//             createdRequest.refFiles = await storeRequestFiles(refFiles, createdRequest.id);
//         }
//         await createdRequest.save();
//         await clientRequestNotification(createdRequest);
//         res.send(createdRequest);
//     } catch(err) {
//         console.log(err);
//         res.status(500).send('Error on creating a request!');
//     }
// });

router.get('/deliverables', checkClientContact, async (req, res) => {
  console.log('route IN DEV for clients  => /deliverables')
  // const { taskId } = req.query;
    // try {
    //     const project = await getProject({"tasks.taskId": taskId});
    //     const task = project.tasks.find(item => item.taskId === taskId);
    //     const taskFiles = task.targetFiles;
    //     const link = await getDeliverablesLink({
    //         taskId, projectId: project.id, taskFiles, unit: task.service.calculationUnit
    //     });
    //     if(link) {
    //         await Projects.updateOne({"tasks.taskId": taskId}, {"tasks.$.deliverables": link});
    //     }
    //     res.send({link});
    // } catch(err) {
    //     console.log(err);
    //     res.status(500).send("Error on downloading deliverables");
    // }
})

router.post('/project-deliverables', checkClientContact, async (req, res) => {
    const { project } = req.body;
    try {
        const result = await getProjectDeliverables(project);
        res.send(result);
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on downloading project deliverables");
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
        res.status(500).send("Error on task status update");
    }
})

router.post('/cancel-quote', checkClientContact, async (req, res) => {
    const { id } = req.body;
    try {
        const request = await updateClientRequest({"_id": id},{ status: "Cancelled" });
      await notifyRequestCancelled(request);
      res.send(request);
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on request quote status update");
    }
})

module.exports = router;
