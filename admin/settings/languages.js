const { Languages } = require('../models');
const { moveFile } = require('../utils');
const fs = require('fs');

async function updateLanguage(obj) {
    const { id, icon, isActive, flag } = obj;
    try {
        if(!flag) {
            return await Languages.updateOne({"_id": id}, {"active": isActive});
        }
        const newIcon = await moveFlagIcon(flag);
        await Languages.updateOne({"_id": id}, {"active": isActive, "icon": newIcon});
        await removeOldIcon(icon);
    } catch(err) {
        console.log(err);
        console.log("Error in updateLanguage func");
    }
}

async function moveFlagIcon(flag) {
        const date = new Date();
        const formattedDate = `${date.getDate()}-${date.getMonth()+1}-${date.getFullYear()}`;
        const newPath = `./dist/static/flags31x21pix/${formattedDate}-${flag[0].filename}`;
        try {
            await moveFile(flag[0], newPath);
        } catch(err) {
            console.log(err);
            console.log("Error in moveFile in moveFlagIcon func");
        }
        return `/static/flags31x21pix/${formattedDate}-${flag[0].filename}`;
}

async function removeOldIcon(icon) {
    try {
        await fs.unlink(`./dist${icon}`, (err) => {
            if(err) console.log("Error on file deleting " + err);
        });
    } catch(err) {
        console.log(err);
        console.log("Error in removeOldIcon func");
    }
}

module.exports = { updateLanguage }; 