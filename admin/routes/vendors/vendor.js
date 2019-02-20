const router = require('express').Router();
const { checkVendor } = require('../../middleware');
const jwt = require("jsonwebtoken");
const { secretKey } = require('../../configs');
const { Vendors } = require('../../models');

router.post("/login", async (req, res, next) => {
    if (req.body.logemail) {
        Vendors.authenticate(req.body.logemail, req.body.logpassword, async (error, vendor) => {
            if (error || !vendor) {
                var err = new Error('Wrong email or password.');
                err.status = 401;
                return next(err);
            } else {
                try {
                const token = await jwt.sign({ vendorId: vendor._id }, secretKey, { expiresIn: '2h'});
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
})

module.exports = router;