const router = require("express").Router();
const upload = require("../../utils/uploads");
const moveFile = require("../../utils/moveFile");
const sendEmail = require("../../utils/mailTemplate");
const applicationMessage = require("../../utils/emailMessages");
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
    let vendor;
    try {
        vendor = await Vendors.create(person);
        person.to = "career@pangea.global";
        person.subject = "Application";
        let languagePairs = [];
        for(let lang of person.languagePairs) {
            let source = await Languages.find({"_id": lang.source});
            let target = await Languages.find({"_id": lang.target});
            languagePairs.push({source: source[0].symbol, target: target[0].symbol})
        }
        let motherTongue = await Languages.find({"_id": person.motherTongue});
        person.motherTongue = motherTongue[0].lang;
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
                    let filePath = moveFile(cv, path);
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
    } catch(err) {
        console.log(err);
    }
    try {
        await Vendors.updateOne({"_id": vendor.id}, {$set: {status: "Potential", cvFiles: person.cvFiles, coverLetterFiles: person.coverLetterFiles}});
    } catch(err) {
        console.log("Error on updating Vendor: " + err)
    }
    let message = applicationMessage(person);
    sendEmail(person, message);
    res.send("Sent");
})

module.exports = router;