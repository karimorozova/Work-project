const router = require('express').Router();
const { checkVendor } = require('../../middleware');
const jwt = require("jsonwebtoken");
const { secretKey } = require('../../configs');
const { Vendors } = require('../../models');
const { getVendor } = require('./getVendors');

router.post("/login", async (req, res, next) => {
    if (req.body.logemail) {
        Vendors.authenticate(req.body.logemail, req.body.logpassword, async (error, vendor) => {
            if (error || !vendor) {
                let err = new Error('Wrong email or password.');
                err.status = 401;
                res.status(401).send("Wrong email or password.");
            } else {
                try {
                const token = await jwt.sign({ vendorId: vendor._id }, secretKey, { expiresIn: '2h'});
                res.statusCode = 200;
                res.send(token);
                } catch(err) {
                    console.log(err);
                    res.status(500).send("Server Error. Try again later.");
                }
            }
        });
    } else {
        let err = new Error('All fields required.');
        err.status = 400;
        res.status(400).send("All fields required.");
    }
})

router.get("/info", checkVendor, async (req, res) => {
    const { token } = req.query;
    try {
        jwt.verify(token, secretKey, async (error, decoded) => {
            if(error) {
                return res.send("Unauthorised");
            }
            const vendor = await getVendor({"_id": decoded.vendorId});
            res.send(vendor);
        });
    } catch(err) {
        console.log(err);
        res.status(500).send("Can't get Vendor info. Try later.");
    }
})

module.exports = router;