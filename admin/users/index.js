const { getMessageWithRandomPassword, sendEmail } = require('../utils');
const passwordGen = require('generate-password');

async function setNewPassword(user) {
    const password = passwordGen.generate({length: 8, numbers: true});
    const message = getMessageWithRandomPassword(password);
    try {
        user.password = password;
        await user.save();
        await sendEmail({to: user.email, subject: "New password for user"}, message);
    } catch(err) {
        console.log(err)
        console.log("Error in setNewPassword")
    }
}

module.exports = { setNewPassword }