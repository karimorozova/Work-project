const router = require("express").Router();
const { upload, moveFile, sendEmail, applicationMessage } = require("../../utils/");
const { Vendors, Languages } = require("../../models");

router.post("/send-form", upload.any(), async (req, res) => {
    let person = {...req.body};
    for(let key in person) {
        let newKey = key.split('-')[1];
        let check = key.split('-')[0];
        if(check === "parsing") {
            person[newKey] = JSON.parse(person[key]);
        }
    }
    try {
        let vendor = await Vendors.create(person);
        person.to = "career@pangea.global";
        person.subject = `Application form ${person.firstName} ${person.surname}`;
        let languagePairs = [];
        for(let lang of person.languagePairs) {
            let source = await Languages.find({"_id": lang.source});
            let target = await Languages.find({"_id": lang.target});
            languagePairs.push({source: source[0].symbol, target: target[0].symbol})
        }
        let motherTongue = await Languages.find({"_id": person.native});
        person.native = motherTongue[0].lang;
        person.languagePairs = languagePairs;
        const cvFiles = req.files["cvFile"];
        const coverLetterFiles = req.files["coverLetterFile"];
        person.cvFiles = [];
        person.coverLetterFiles = [];
        if(cvFiles) {
            let counter = 1
            for(let cv of cvFiles) {
                    let newFileName = `cvFile${counter}_${cv.filename}`;
                    const path = `/application/${vendor.id}/${newFileName}`;
                    await moveFile(cv, `./dist${path}`);
                    person.cvFiles.push(path);
                    counter++;
            }
        }
        if(coverLetterFiles) {
            let counter = 1
            for(let cv of coverLetterFiles) {
                    let newFileName = `coverLetterFile${counter}_${cv.filename}`;
                    const path = `/application/${vendor.id}/${newFileName}`;
                    await moveFile(cv, `./dist${path}`);
                    person.coverLetterFiles.push(path);
                    counter++;
            }
        }
        await Vendors.updateOne({"_id": vendor.id}, {$set: {status: "Potential"}});
        let message = applicationMessage(person);
        await sendEmail(person, message);
        res.send("Sent");
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on updating Vendor");
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