const { Vendors } = require('../models');
const bcrypt = require('bcryptjs');
const { moveFile } = require('../utils/movingFile');
const fs = require('fs');

async function saveHashedPassword(id, pass) {
    try {
        bcrypt.hash(pass, 10, async (err, hash) => {
            if (err) {
                throw new Error("bcrypt error");
            }
            let hashedPassword = hash;
            await Vendors.updateOne({"_id": id}, { password: hashedPassword })
        })
    } catch(err) {
        console.log(err);
        console.log("Error in saveHashedPassword")
    }
}

async function getPhotoLink(id, file) {
    try {
        const newPath = await moveFile(file[0], `./dist/vendorsDocs/${id}/${file[0].filename}`);
        return newPath.split('./dist')[1];
    } catch(err) {
        console.log(err);
        console.log("Error in getPhotoLink");
    }
}

function removeOldPhoto(oldPath, newPath) {
    if(oldPath === newPath || !oldPath) return;
    return new Promise((resolve, reject) => {
        fs.unlink(`./dist${oldPath}`, (err) => {
            if (err) {
                console.log(err);
                console.log("Error in removeOldPhoto");
                reject(err);
            }
        });
        resolve("removed");
    })
}

module.exports = { saveHashedPassword, getPhotoLink, removeOldPhoto }