const router = require('express').Router();
const { checkVendor } = require('../../middleware');
const jwt = require("jsonwebtoken");
const { secretKey } = require('../../configs');
const { Vendors, Projects } = require('../../models');
const { getVendor, getVendorAfterUpdate } = require('./getVendors');
const { saveHashedPassword, getPhotoLink, removeOldPhoto } = require('./info');
const { getVendorRates } = require('./vendorRates');
const { getJobs, updateStepProp } = require('./jobs');
const { upload } = require('../../utils');


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
        const verificationResult = jwt.verify(token, secretKey);
        const vendor = await getVendor({"_id": verificationResult.vendorId});
        res.send(vendor);
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on getting Vendor info. Try later.");
    }
})

router.post("/info", checkVendor, upload.fields([{ name: 'photo' }]), async (req, res) => {
    let info = JSON.parse(req.body.info)
    let { id, password } = req.body;
    const photoFile = req.files["photo"];
    try {
        if(password) {
            await saveHashedPassword(id, password);
        }
        if(photoFile) {
            let oldPath = info.photo;
            info.photo = await getPhotoLink(id, photoFile);
            removeOldPhoto(oldPath, info.photo);
        }
        vendor = await getVendorAfterUpdate({"_id": id}, { ...info })
        res.send(vendor);
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on saving data. Try later.");
    }
})

router.get("/rates", checkVendor, async (req, res) => {
    const { id, form } = req.query;
    try {
        const vendor = await getVendor({"_id": id});
        const rates = await getVendorRates({vendor, form});
        res.send(rates);
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on getting rates.");
    }
})

router.get("/jobs", checkVendor, async (req, res) => {
    const { token } = req.query;
    try {
        const verificationResult = jwt.verify(token, secretKey);
        const jobs = await getJobs(verificationResult.vendorId);
        res.send(jobs);
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on getting jobs.");
    }
})

router.post("/job", checkVendor, async (req, res) => {
    const { jobId, status } = req.body;
    try {
        await updateStepProp({jobId, prop: 'status', value: status});
        res.send("Status updated");
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on changing job status");
    }
})

router.post("/selected-job", checkVendor, async (req, res) => {
    const { jobId, value } = req.body;
    try {
        await updateStepProp({jobId, prop: 'isVendorRead', value});
        res.send("Terms agreement status changed");
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on checking job's terms agreement");
    }
})

module.exports = router;