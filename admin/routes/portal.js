const { ClientApi } = require('../models/xtrf');
const { jobInfo, quoteTasksInfo } = require('../models/xtrf/report')
const router = require('express').Router();

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
})

module.exports = router;