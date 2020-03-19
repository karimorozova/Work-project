const { Vendors } = require('../models');
const { getVendorAfterUpdate } = require('./getVendors');
const bcrypt = require('bcryptjs');
const { moveFile } = require('../utils/movingFile');
const fs = require('fs');

async function saveVendorDocument({vendorId, file, category, oldFilePath}) {
    try {
        const vendor = await Vendors.findOne({_id: vendorId});
        let { documents } = vendor;
        const namePrefix = category.slice(0, 3).toLowerCase();
        const newPath = `/vendorsDocs/${vendorId}/${namePrefix}-${file.filename}`;
        await moveFile(file, `./dist${newPath}`);
        const newDoc = {fileName: file.filename, path: newPath, category};
        if(oldFilePath) {
            await removeOldVendorFile(oldFilePath, newPath);
            const index = documents.findIndex(item => item.path === oldFilePath && item.category === category);
            documents.splice(index, 1, newDoc)
        } else {
            documents.push(newDoc);
        }
        return getVendorAfterUpdate({_id: vendorId}, { documents });
    } catch(err) {
        console.log(err);
        console.log("Error in saveVendorDocument");
    }
}

async function removeVendorDoc({vendorId, fileName, path, category}) {
    try {
        await removeOldVendorFile(path, "");
        return await getVendorAfterUpdate({_id: vendorId}, {$pull: {documents: {fileName, path, category}}});
    } catch(err) {
        console.log(err);
        console.log("Error in removeVendorDoc");
    }
}

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

function removeOldVendorFile(oldPath, newPath) {
    if(oldPath === newPath || !oldPath) return;
    return new Promise((resolve, reject) => {
        fs.unlink(`./dist${oldPath}`, (err) => {
            if (err) {
                console.log(err);
                console.log("Error in removeOldVendorFile");
                reject(err);
            }
        });
        resolve("removed");
    })
}

module.exports = { saveVendorDocument, removeVendorDoc, saveHashedPassword, getPhotoLink, removeOldVendorFile }