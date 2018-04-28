const { ClientApi } = require('../models/xtrf');
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

router.get('/clientsinfo', async (req, res) => {
    var customer = new Customer("", req.cookies.ses);
    const userId = await (customer.userInfo());
    const fullInfo = await (customer.companyInfo(userId.data.parentId));
    res.send(fullInfo.data);
});

module.exports = router;