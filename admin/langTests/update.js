const { LangTest } = require('../models');
const { moveFile } = require('../utils/movingFile');
const { getUpdatedTest } = require('./get');
const fs = require('fs');

async function  updateLangTest(langTest, testFile) {
    const { _id, oldPath, ...testData } = langTest;
    try {
        const path = `/langTestsFiles/${testFile.filename.replace(/\s+/g, '_')}`;
        await moveFile(testFile, `./dist${path}`);
        if(_id) {
            await getUpdatedTest({ _id }, {...testData, fileName: testFile.filename, path});
            return await removeOldFile(oldPath, path);
        }
        await LangTest.create({
            ...testData,
            fileName: testFile.filename, 
            path
        })
    } catch(err) {
        console.log(err);
        console.log("Error in updateLangTest");
    }
}

async function removeLangTest(_id, path) {
    try {
        await LangTest.deleteOne({_id});
        await removeOldFile(path, "");
    } catch(err) {
        console.log(err);
        console.log("Error in removeLangTest");
    }
}

function removeOldFile(oldPath, newPath) {
    if(oldPath === newPath || !oldPath) return;
    return new Promise((resolve, reject) => {
        fs.unlink(`./dist${oldPath}`, (err) => {
            if (err) {
                console.log(err);
                console.log("Error in removeOldFile");
                reject(err);
            }
        });
        resolve("removed");
    })
}

module.exports = {
    updateLangTest,
    removeLangTest
}