const { testSentMessage, testNotPassedMessage, testPassedMessage } = require("../emailMessages/candidateCommunication");
const { sendEmail } = require("../utils/mailTemplate");
const fs = require("fs");

async function notifyTestStatus({vendor, qualification, testPath, template}) {
    const {source, target, industry, status} = qualification;
    let messageId = "CAN001.0"; 
    let subject = `${target.lang} - Translator@Pangea position - Sample text for translation (ID ${messageId})`;
    let message;
    template ? message = template : message = testSentMessage({...vendor, source, target, industry});
    try {
        if(status === "Test Sent") {
            const attachments = [{filename: testPath.split("/").pop(), content: fs.createReadStream(`./dist${testPath}`)}];
            return await sendEmail({to: vendor.email, subject, attachments}, message);
        } 
        messageId = status === "Passed" ? "CAN003.0" : "CAN002.0";
        subject = status === "Passed" ? 
            `${target.lang} - Translator@Pangea position - Test Passed (ID ${messageId})` 
            : `${target.lang} - Translator@Pangea position - Test Not Passed (ID ${messageId})`;
        message = status === "Passed" ? testPassedMessage(vendor) : testNotPassedMessage({...vendor, target});
        await sendEmail({to: vendor.email, subject}, message);
    } catch(err) {
        console.log(err);
        console.log("Error in notifyTestStatus");
    }
}

module.exports = {
    notifyTestStatus
}