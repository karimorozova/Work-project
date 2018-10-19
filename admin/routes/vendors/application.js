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
        const cvFiles = req.files.filter(item => {
            return item.fieldname == "cvFile"
        })
        const coverLetterFiles = req.files.filter(item => {
            return item.fieldname == "coverLetterFile"
        })
        if(cvFiles) {
            let counter = 1
            person.cvFiles = [];
            for(let cv of cvFiles) {
                    let nameArr = cv.filename.split('.');
                    let newFileName = `cvFile${counter}.${nameArr[nameArr.length-1]}`;
                    let path = `./dist/application/${vendor.id}/${newFileName}`;
                    let filePath = await moveFile(cv, path);
                    person.cvFiles.push(filePath);
                    counter++;
            }
        }
        if(coverLetterFiles) {
            let counter = 1
            person.coverLetterFiles = [];
            for(let cv of coverLetterFiles) {
                    let nameArr = cv.filename.split('.');
                    let newFileName = `coverLetterFile${counter}.${nameArr[nameArr.length-1]}`;
                    let path = `./dist/application/${vendor.id}/${newFileName}`;
                    let filePath = moveFile(cv, path);
                    person.coverLetterFiles.push(filePath);
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

module.exports = router;