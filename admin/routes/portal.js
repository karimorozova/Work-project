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
        
    req.end(()=> {
        console.log("Pipe is done");
        setTimeout( () => {
            res.send(`File created!`);
        }, 2000)
    });
    
})

router.get('/downloadProject', (req, res) => {
    res.send(`http://localhost:3001/project${req.query.projectId}.zip`);
})

router.get('/deleteZip', (req, res) => {
    setTimeout(() => {
        fs.unlink(`./dist/project${req.query.projectId}.zip`, (err) => console.log(err));
    }, 6000)
    res.send('Deleted');
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


module.exports = router;