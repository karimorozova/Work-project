const { ClientApi, HomeApi } = require('../models/xtrf');
const { jobInfo, quoteTasksInfo } = require('../models/xtrf/report');
const router = require('express').Router();
const fs = require('fs');
const https = require('https');

router.get('/', (req, res) => {
    res.send("portal");
});

router.post('/auth', async (req, res, next) => {
    try{ 
        if (req.body.logemail && req.body.logpassword) {
            var jsessionId = await (ClientApi.authUser(req.body.logemail, req.body.logpassword));
            var customer = new ClientApi("",jsessionId);
            var userInfo = await (customer.userInfo());
            var userdata = await (customer.getName());
            res.statusCode = 200;
            req.session.name = userdata.data.name;
            req.session.jsessionId = jsessionId; 
            res.send(jsessionId);
        } else {
            let err = new Error('All fields required.');
            err.status = 400;
            return next(err);
        }
    } catch(err) {
        console.log(err);
        res.status(500).send('Error on authorisation');            
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
})

router.get('/customer-info', async (req, res) => {
    try {
        let customer = await HomeApi.customerInfo(req.query.customerId);
        res.send(customer)
    } catch(err) {
        console.log(err);
        res.status(500).send('Error on getting customer info');
    }
})

router.get('/clientinfo', async (req, res) => {
    let customer = new ClientApi("", req.cookies.ses);
    try {
        const userId = await (customer.userInfo());   
        const userInfo = await (customer.fullUserInfo(userId.data.parentId, userId.data.id));
        const fullInfo = await (customer.projectsInfo());
        const quotesInfo = await (customer.quotesInfo());
        const companyInfo = await (customer.companyInfo(userId.data.parentId));
        const clientLanguages = await (customer.languageComb(userId.data.parentId));
        const projects = fullInfo.data;
        const quotes = quotesInfo.data;
        const client = companyInfo.data;
        const user = userInfo.data;
        const languageCombinations = clientLanguages.data;
        res.send({user, client, projects, quotes, languageCombinations});
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
})

router.get('/downloadProject', (req, res) => {
    res.send(`https://admin.pangea.global/project${req.query.projectId}.zip`);
})

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
        }, 6000)
        res.send('Deleted');
    } catch(err) {
        console.log(err);
        res.status(500).send('Error on deleting file');        
    }
})

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
})

router.get('/downloadTask', (req, res) => {
    res.send(`https://admin.pangea.global/task${req.query.taskId}.zip`);
})

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

module.exports = router;