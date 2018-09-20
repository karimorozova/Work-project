const upload = require("../../utils/uploads");
const sendEmail = require("../../utils/mailTemplate");
const router = require('express').Router();

router.post("/send-form", async (req, res) => {
    const person = req.body;
    person.to = "daniyal@wellyes.ru";
    person.subject = "Application";
    await sendEmail(person, "This works well.");
    res.send("Sent");
})

module.exports = router;