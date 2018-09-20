const upload = require("../../utils/uploads");
const { applicationMail } = require("../../utils/careerMail");
const router = require('express').Router();

router.post("/send-form", async (req, res) => {
    const person = req.body;
    await applicationMail(person);
    res.send("Sent");
})

module.exports = router;