const { moveFile } = require('../utils/movingFile');

async function storeRequestFiles(filesArr, requestId) {
    try {
        let storedFiles = [];
        if(filesArr.length) {
            for(let file of filesArr) {
                const newPath = `./dist/reqfiles/${requestId}/${file.filename.replace(/\s+/g, '_')}`;
                await moveFile(file, newPath);
                storedFiles.push({path: newPath, fileName: file.filename, isApproved: false});
            }
        }
        return storedFiles;
    } catch(err) {
        console.log(err);
        console.log("Error in storeFiels")
    }
}

module.exports = { storeRequestFiles };