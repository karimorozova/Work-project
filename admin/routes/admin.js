const router = require('express').Router();
const path = require('path');
const { User, Requests, Reports, Clients, Vendors } = require('../models');
const { getVendors } = require('./vendors/');
const { getClients} = require('../clients/');
const { requiresLogin } = require('../middleware/index');
const jwt = require("jsonwebtoken");
const { secretKey } = require('../configs');

router.get('/', (req, res) => {
    res.sendFile(path.resolve() + '/dist/index.html');
});

router.get('/tasks-report', (req, res) => {
    res.sendFile(path.resolve() + '/dist/index.html');
});
router.get('/register', (req, res) => {
    res.sendFile(path.resolve() + '/dist/index.html');
});

router.get('/login', (req, res) => {
    res.sendFile(path.resolve() + '/dist/index.html');
});

router.get('/main', (req, res) => {
    res.sendFile(path.resolve() + '/dist/index.html');
});

// GET /logout
router.get('/logout', (req, res, next) => {
    if (req.session) {
        // delete session object
        req.session.destroy((err) => {
            if (err) {
                return next(err);
            } else {
                return res.redirect('/');
            }
        });
    }
});

router.get('/all-clients', requiresLogin, async (req, res, next) => {
    try {
        const clients = await getClients({});
        res.send(clients);
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on gettin Clients from DB ");
    }
})

router.get('/all-vendors', requiresLogin, async (req, res, next) => {
    try {
        const vendors = await getVendors({});
        res.send(vendors)
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on gettin Vendors from DB ");
    }
})

router.get('/users', requiresLogin, async (req, res, next) => {
    try {
        const users = await User.find({},{"_id": 1, username: 1});
        res.send(users)
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on gettin Users from DB");
    }
})

router.get('/requests', requiresLogin, async (req, res, next) => {
    try {
        const requests = await Requests.find();
        res.send(requests)
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on gettin Requests from DB ");
    }
});

router.get('/reps', requiresLogin, (req, res) => {
    Reports.find()
        .then(requests => {
            res.send(requests)
        })
        .catch(err => {
            console.log(err)
        })
});

router.post('/login', (req, res, next) => {
    if (req.body.logemail && req.body.logpassword) {
        User.authenticate(req.body.logemail, req.body.logpassword, async (error, user) => {
            if (error || !user) {
                var err = new Error('Wrong email or password.');
                err.status = 401;
                return next(err);
            } else {
                try {
                const token = await jwt.sign({ user }, secretKey, { expiresIn: '2h'});
                req.session.userId = user._id;
                res.statusCode = 200;
                res.send(token);
                } catch(err) {
                    console.log(err);
                    return next(err);
                }
            }
        });
    } else {
        let err = new Error('All fields required.');
        err.status = 400;
        return next(err);
    }
});

module.exports = router;