const router = require('express').Router();
const path = require('path');
const { User, Requests, Reports } = require('../models');
const { requiresLogin } = require('../utils/middleware');

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

router.get('/requests', requiresLogin, (req, res) => {
    Requests.find()
        .then(requests => {
            res.send(requests)
        })
        .catch(err => {
            console.log(err)
        })
});

router.get('/reps', (req, res) => {
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
        User.authenticate(req.body.logemail, req.body.logpassword, (error, user) => {
            if (error || !user) {
                var err = new Error('Wrong email or password.');
                err.status = 401;
                return next(err);
            } else {
                req.session.userId = user._id;
                res.statusCode = 200;
                res.send('Loggin in!');
            }
        });
    } else {
        let err = new Error('All fields required.');
        err.status = 400;
        return next(err);
    }
});



module.exports = router;