const { ClientApi } = require('../models/xtrf');
const { jobInfo, quoteTasksInfo } = require('../models/xtrf/report');
const { getSpecializations } = require('../models/xtrf/home');
const router = require('express').Router();
const fs = require('fs');
var unirest = require('unirest');
const https = require('https');

router.get('/', (req, res) => {
    res.send("portal");
});

router.post('/auth', async (req, res, next) => {
    if (req.body.logemail && req.body.logpassword) {
        var jsessionId = await (ClientApi.authUser(req.body.logemail, req.body.logpassword));
        var customer = new ClientApi("",jsessionId);
        var userInfo = await (customer.userInfo());
        var userdata = await (customer.getName());
        res.statusCode = 200;
        req.session.name = userdata.data.name;
        res.send(jsessionId);
    } else {
        let err = new Error('All fields required.');
        err.status = 400;
        return next(err);
    }
});

router.get('/clientinfo', async (req, res) => {
    var customer = new ClientApi("", req.cookies.ses);
    // console.log('req.cookies.ses : ' + req.cookies.ses );
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
});

router.get('/projectFiles', async (request, res) => {
    var options = {
        hostname: 'pangea.s.xtrf.eu',
        path: `/customer-api/projects/${request.query.projectId}/files/outputFilesAsZip`,
        method: 'GET',
        headers: {
            'Cookie': `JSESSIONID=${request.cookies.ses}`,
        }
    };

    var wstream = fs.createWriteStream(`./dist/project${request.query.projectId}.zip`);
    var req = await https.request(options, (resp) => {
        
        resp.pipe(wstream);
    });
    req.end(); 
    wstream.on('finish', () => {
        res.send('File created!')
    })
    
})

router.get('/downloadProject', (req, res) => {
    res.send(`http://localhost:3001/project${req.query.projectId}.zip`);
})

router.get('/deleteZip', (req, res) => {
    var fileName = 'project';
    var fileId = req.query.projectId;
    if (req.query.taskId) {
        fileName = 'task';
        fileId = req.query.taskId;
    }
    setTimeout(() => {
        fs.unlink(`./dist/${fileName}${fileId}.zip`, (err) => console.log(err));
    }, 6000)
    res.send('Deleted');
})

router.get('/taskFiles', async (request, res) => {
    var options = {
        hostname: 'pangea.s.xtrf.eu',
        path: `/customer-api/projects/tasks/${request.query.taskId}/files/outputFilesAsZip`,
        method: 'GET',
        headers: {
            'Cookie': `JSESSIONID=${request.cookies.ses}`,
        }
    };

    var wstream = fs.createWriteStream(`./dist/task${request.query.taskId}.zip`);
    var req = await https.request(options, (resp) => {
        
        resp.pipe(wstream);
    });
        
    req.end(); 
    wstream.on('finish', () => {
        res.send('File created!')
    })
    
})

router.get('/downloadTask', (req, res) => {
    res.send(`http://localhost:3001/task${req.query.taskId}.zip`);
})

router.get('/job',async (req, res) => {
    var id = req.query.projectId;
    const jobById = await jobInfo(id);
    res.send({jobById});
});

router.get('/tasksInfo', async (req,res) => {
    var id = req.query.quoteId;
    const tasksOfQuote = await quoteTasksInfo(id);
    res.send({tasksOfQuote});
});

router.get('/approve', async (req, res) => {
    var customer = new ClientApi("", req.cookies.ses);
    var id = req.query.quoteId;
    const result = await customer.quoteApprove(id);
    res.send("approved");
});

router.get('/reject', async (req, res) => {
    var customer = new ClientApi("", req.cookies.ses);
    var id = req.query.quoteId;
    const result = await customer.quoteReject(id);
    res.send("rejected");
});

router.get('/xtmTest', async (req, res) => {
    // unirest.post('https://www.xtm-cloud.com/rest-api/projects')
    // .headers({"Authorization": "XTM-Basic lGoRADtSF14/TQomvOJnHsEhNZLn0NBL81J2rJA6g5RknA6yOC0LRCDWhLDP9OWaTl+GM7dPQX7Z5zqRgx2Y/A==",
    // 'Content-Type': 'multipart/form-data'}) 
    // .field('customerId', 23)
    // .field('name',  'Project-Test')
    // .end( (response) => {
    //     console.log(response.body);
    //     res.send('Done')
    // })
    
    var options = {
        host: 'xtm-cloud.com',
        path: '/rest-api/projects',
        method: 'POST',
        headers: {
            "Authorization": "XTM-Basic lGoRADtSF14/TQomvOJnHsEhNZLn0NBL81J2rJA6g5RknA6yOC0LRCDWhLDP9OWaTl+GM7dPQX7Z5zqRgx2Y/A==",
            'Content-Type': 'multipart/form-data'
        }
    }

    var requ = https.request(options, (resp) => {
        console.log('There...');
        resp.on('data', (body) => {
            console.log('Done');
        })
    })
    requ.write('{"customerId": 23}');
    requ.write('{"name": "Project-test"}')
    requ.end();
    res.send('Done');
})

module.exports = router;