const router = require('express').Router();
const { User, Requests, Reports } = require('../models');
const { getVendors } = require('../vendors');
const { gerFilteredClients, getClients } = require('../clients');
const { requiresLogin } = require('../middleware/index');
const jwt = require("jsonwebtoken");
const { secretKey } = require('../configs');
const { setNewPassword } = require('../users');

router.get('/logout', (req, res, next) => {
    if (req.session) {
        req.session.destroy((err) => {
            if (err) {
                return next(err);
            } else {
                return res.redirect('/');
            }
        });
    }
});

router.post('/reset-pass', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({"email": email});
        if(!user) {
            return res.status(400).send("No such user"); 
        }
        await setNewPassword(user);
        return res.send("new password sent");
    } catch(err) {
        console.log(err);
        res.status(500).send("Server error. Try again later.");
    }
})

router.post('/all-clients', requiresLogin, async (req, res) => {
    const { filters } = req.body;
    try {
        const clients = await gerFilteredClients(filters);
        res.send(clients);
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on getting Clients from DB ");
    }
})

router.get('/active-clients', requiresLogin, async (req, res) => {
    const { status } = req.query;
    try {
        const clients = await getClients({status});
        res.send(clients);
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on getting Clients from DB ");
    }
})

router.get('/all-vendors', requiresLogin, async (req, res) => {
    try {
        const { filter } = req.query;
        const query = filter ? {status: filter} : {};
        const vendors = await getVendors(query);
        res.send(vendors)
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on getting Vendors from DB ");
    }
})

router.get('/users', requiresLogin, async (req, res, next) => {
    try {
        const users = await User.find({},{
            "_id": 1, username: 1, firstName: 1, lastName: 1, email: 1}).populate('group');
        res.send(users)
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on getting Users from DB");
    }
})

router.get('/users-full', requiresLogin, async (req, res, next) => {
    try {
        const users = await User.find({},{password: 0}).populate('group');
        res.send(users)
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on getting Users from DB");
    }
})

router.get('/user', requiresLogin, async (req, res, next) => {
    try {
        const key = req.query["key"];
        const result = jwt.verify(key, secretKey);
        const loggedUser = Object.keys(result.user).reduce((init, cur) => {
            if(cur !== "__v" && cur !== "password") {
                init[cur] = result.user[cur];
            }
            return {...init};
        }, {});
        res.send({ ...loggedUser });
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on getting User from DB");
    }
})

router.post('/user', requiresLogin, async (req, res) => {
    const { user } = req.body;
    const { _id, username, firstName, lastName, email, position, group } = user;
    try {
        if(_id) { 
            await User.updateOne({"_id": user._id}, { firstName, lastName, email, position, group });
        } else {
            const password = "12345";
            await User.create({username, password, firstName, lastName, email, position, group});
        }
        res.send("User info saved");
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on saving user info");
    }
})

router.delete("/user/:id", requiresLogin, async (req, res) => {
    const { id } = req.params;
    const { token } = req.body;
    try {
        await User.deleteOne({"_id": id});
        const tokenValue = JSON.parse(token).value;
        const result = jwt.verify(tokenValue, secretKey);
        if(result.user._id === id) {
            return res.send('logout');
        }
        res.send("User removed")
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on deleting user");
    }
 })

router.get('/requests', requiresLogin, async (req, res, next) => {
    try {
        const requests = await Requests.find();
        res.send(requests)
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on getting Requests from DB ");
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
                const loggedUser = Object.keys(user).reduce((init, cur) => {
                    if(cur !== "__v" && cur !== "password") {
                        init[cur] = user[cur];
                    }
                    return {...init};
                }, {});
                res.send({token, ...loggedUser});
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