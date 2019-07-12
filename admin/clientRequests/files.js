const { moveFile } = require('../utils/movingFile');
const fs = require('fs');

async function storeRequestFiles(filesArr, requestId) {
    try {
        let storedFiles = [];
        if(filesArr.length) {
            for(let file of filesArr) {
                const newPath = `/reqfiles/${requestId}/${file.filename.replace(/\s+/g, '_')}`;
                await moveFile(file, `./dist${newPath}`);
                storedFiles.push({path: newPath, fileName: file.filename, isApproved: false});
            }
        }
        return storedFiles;
    } catch(err) {
        console.log(err);
        console.log("Error in storeFiels");
    }
}

async function addRequestFile({request, files, existingFile, prop}) {
    try {
        let requestFiles = request[prop];
        const storedFiles = await storeRequestFiles(files, request.id);
        requestFiles.push(...storedFiles);
        if(existingFile.fileName) {
            await deleteOldFile(`./dist${existingFile.path}`);
            return requestFiles.filter(item => item.path !== existingFile.path);
        }
        return requestFiles;
    } catch(err) {
        console.log(err);
        console.log("Error in addRequestFile");
    }
}

async function removeRequestFiles(removingFiles, requestFiles) {
    const removingPaths = removingFiles.map(item => item.path);
    try {
        for(let file of removingFiles) {
            await deleteOldFile(`./dist${file.path}`);
        }
        return requestFiles.filter(item => removingPaths.indexOf(item.path) === -1);
    } catch(err) {
        console.log(err);
        console.log("Error in removeRequestFiles");
    }
}

async function removeRequestFile({path, files}) {
    try {
        await deleteOldFile(`./dist${path}`);
        return files.filter(item => item.path !== path);
    } catch(err) {
        console.log(err);
        console.log("Error in removeRequestFile");
    }
}

function deleteOldFile(path) {
    return new Promise((resolve, reject) => {
        fs.unlink(path, (err, res) => {
            if(err) {
                reject(err)
            } else {
                resolve(res)
            }
        });
    })
}

module.exports = { storeRequestFiles, addRequestFile, removeRequestFile, removeRequestFiles };