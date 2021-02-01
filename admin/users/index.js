const { sendEmail, moveFile } = require('../utils');
const { getMessageWithRandomPassword } = require('../emailMessages/internalCommunication');
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
        vendor.temporaryEyes = password;
        await vendor.save();
        await sendEmail({to: email, subject: "New password for user"}, message);
    } catch(err) {
        console.log(err);
        console.log("Error in setVendorNewPassword");
    }
}

async function updateAccountDetails({user, clientId, accountData, photoFile}) {
    const { email, firstName, surname, password, phone, skype } = accountData;
    const updatedUser = {
        ...user,
        firstName,
        surname,
        email: email || user.email,
        phone: phone || user.phone,
        skype: skype || user.skype
    }
    try {
        updatedUser.password = password ? await bcrypt.hash(password, 10) : user.password;
        updatedUser.photo = photoFile ? await updateAccountPhoto(photoFile, updatedUser, clientId) : user.photo;
        return updatedUser;
    } catch(err) {
        console.log(err);
        console.log("Error in updateAccountDetails");
    }
}

async function updateAccountPhoto(photoFile, user, clientId) {
    try {
        if(user.photo) {
            await fs.unlink('./dist' + user.photo);
        }
        const newPath = `/clientsDocs/${clientId}/contacts/${user.firstName.replace(/ /g,"_")}-${user.surname.replace(/ /g,"_")}-${photoFile.filename.replace(/ /g,"_")}`;
        await moveFile(photoFile, `./dist${newPath}`);
        return newPath;
    } catch(err) {
        console.log(err);
        console.log("Error in updateAccountPhoto");
    }
}

module.exports = { setNewPassword, setClientsContactNewPassword, setVendorNewPassword, updateAccountDetails }