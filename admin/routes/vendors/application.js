const router = require("express").Router();
const upload = require("../../utils/uploads");
const moveFile = require("../../utils/moveFile");
const sendEmail = require("../../utils/mailTemplate");
const { Vendors } = require("../../models");

router.post("/send-form", upload.any(), async (req, res) => {
    let person = {...req.body};
    for(let key in person) {
        let newKey = key.split('-')[1];
        let check = key.split('-')[0];
        if(check === "parsing") {
            person[newKey] = JSON.parse(person[key]);
        }
    }
    person.to = person.email;
    person.subject = "Application";
    let cvFiles = req.files.filter(item => {
        return item.fieldname == "cvFile"
    })
    if(cvFiles) {
        person.cvFiles = [];
        for(let cv of cvFiles) {
            try {
                let path = `application/12345/${cv.filename}`;
                let filePath = moveFile(cv, path);
                person.cvFiles.push(filePath);
            } catch(err) {
                console.log("Cannot move file: " + err)
            }
        }
    }
    console.log(person.cvFiles);
    sendEmail(person, "This works well.");
    res.send("Sent");
})

module.exports = router;