const { getMessageWithRandomPassword, sendEmail } = require('../utils');
const passwordGen = require('generate-password');
const bcrypt = require('bcryptjs');

function getMessageWithNewPassword() {
    const password = passwordGen.generate({length: 8, numbers: true});
    const message = getMessageWithRandomPassword(password);
    return { password, message };
}

async function setNewPassword(user) {
    const { password, message } = getMessageWithNewPassword();
    try {
        user.password = password;
        await user.save();
        await sendEmail({to: user.email, subject: "New password for user"}, message);
    } catch(err) {
        console.log(err);
        console.log("Error in setNewPassword");
    }
}

async function setClientsContactNewPassword(client, email) {
    const { password, message } = getMessageWithNewPassword();
    try {
        let contactIndex = client.contacts.findIndex(item => item.email === email);
        const hash = await bcrypt.hash(password, 10);
        client.contacts[contactIndex].password = hash;
        await client.save();
        await sendEmail({to: email, subject: "New password for user"}, message);
    } catch(err) {
        console.log(err);
        console.log("Error in setClientsContactNewPassword");
    }
}

async function setVendorNewPassword(vendor, email) {
    const { password, message } = getMessageWithNewPassword();
    try {
        vendor.password = password;
        await vendor.save();
        await sendEmail({to: email, subject: "New password for user"}, message);
    } catch(err) {
        console.log(err);
        console.log("Error in setVendorNewPassword");
    }
}

module.exports = { setNewPassword, setClientsContactNewPassword, setVendorNewPassword }