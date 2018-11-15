const { moveFile } = require('../utils/movingFile');
const fse = require('fs-extra');
const fs = require('fs');
const path = require('path');

async function storeFiles(filesArr, projectId) {
    let storedFiles = [];
    if(filesArr.length) {
        for(let file of filesArr) {
            const newPath = `./dist/projectFiles/${projectId}/${file.filename.replace(/\s+/g, '_')}`;
            try {
                await fse.copy(file.path, newPath);
            } catch(err) {
                throw new Error("Error from storeFiels")
            }
            storedFiles.push(newPath);
        }
    }
    return storedFiles;
}

async function deleteCopiedFiles() {
    try {
        const directory = './dist/uploads/';
        const files = await fse.readdir(directory);
        for (const file of files) {
            await fs.unlink(path.join(directory, file), (err) => {
                if(err) throw err;
            });
        }
    } catch(err) {
        console.log(err);
        throw new Error("error on deleting files from uploads / deleteCopiedFiles")
    }
}

module.exports = { storeFiles, deleteCopiedFiles };
