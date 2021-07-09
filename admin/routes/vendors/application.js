const router = require("express").Router();
const { upload } = require("../../utils/");
const { Vendors } = require("../../models");
const { manageNewApplication } = require("../../vendors");

router.post("/send-form", upload.any(), async (req, res) => {
    let {infoForMail, ...person} = {...req.body};
    const cvFiles = req.files.filter(item => item.fieldname === "cvFile");
    const coverLetterFiles = req.files.filter(item => item.fieldname === "coverLetterFile");
    try {
        await manageNewApplication({person, cvFiles, coverLetterFiles, infoForMail: JSON.parse(infoForMail)});
        res.send("Sent");
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on sending application form");
    }
})

router.get("/unique-email", async (req, res) => {
    const { email } = req.query;
    try {
        const vendor = await Vendors.findOne({"email": email});
        if(vendor) {
            return res.send("exist");
        }
        res.send("");
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on checking Vendor email uniqueness.")
    }
})

module.exports = router;