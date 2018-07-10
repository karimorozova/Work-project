const { ClientApi } = require('../models/xtrf');
const { jobInfo, quoteTasksInfo } = require('../models/xtrf/report');
const { getSpecializations } = require('../models/xtrf/home');
const router = require('express').Router();
const fs = require('fs');
var unirest = require('unirest');
const https = require('https');
const soap = require('soap');
const Scookie = require('soap-cookie');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

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
    // unirest.post('http://wstest2.xtm-intl.com/rest-api/projects')
    // .headers({"Authorization": "XTM-Basic lGoRADtSF14/TQomvOJnHrIFg5QhHDPwrjlgrQJOLtnaYpordXXn98IwnSjt+7fQJ1FpjAQz410K6aGzYssKtQ==",
    // 'Content-Type': 'multipart/form-data'}) 
    // .field('customerId', 23)
    // .field('name',  'Project-Test')
    // .field('sourceLanguage', 'pl_PL')
    // .field('targetLanguages', 'en_GB')
    // .field('workflowId', 2890)
    // .end( (response) => {
    //     console.log(response.body);
    //     res.send('Done')
    // })
    var customerName = "TestSoapCustomer";
    var str = '<?xml version="1.0" encoding="UTF-8"?>' +
        '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:pm="http://pm.v2.webservice.projectmanagergui.xmlintl.com/">' +
    '<soapenv:Header/>' +
    '<soapenv:Body>' +
      '<pm:createCustomer>'+
         '<loginAPI>'+
            '<client>Pangea</client>' +
            '<password>pm</password>' +
            '<userId>3150</userId>' +
         '</loginAPI>' +
         '<customer>' + 
            '<customerBase>' +
               `<name>${customerName}</name>` +
            '</customerBase>' +
         '</customer>' +
         '<options/>' +
      '</pm:createCustomer>' +
    '</soapenv:Body>' +
    '</soapenv:Envelope>';
    function createCORSRequest(method, url) {
        var xhr = new XMLHttpRequest();
        if ("withCredentials" in xhr) {
            xhr.open(method, url, false);
        } else if (typeof XDomainRequest != "undefined") {
            alert
            xhr = new XDomainRequest();
            xhr.open(method, url);
        } else {
            console.log("CORS not supported");
            alert("CORS not supported");
            xhr = null;
        }
        return xhr;
    }
    var xhr = createCORSRequest("POST", "http://wstest2.xtm-intl.com/project-manager-gui/services/v2/XTMProjectManagerMTOMWebService?wsdl");
    if(!xhr){
    console.log("XHR issue");
    return;
    }

    xhr.onload = function (){
    var results = xhr.responseText;
    console.log(results);
    res.send('Soap request done!');
    }

    xhr.setRequestHeader('Content-Type', 'text/xml');
    xhr.send(str);
})




module.exports = router;