const { moveFile } = require('../utils/movingFile');

async function storeFiles(filesArr, projectId) {
    let storedFiles = [];
    if(filesArr.length) {
        for(let file of filesArr) {
            let newFilePath = await moveFile(file, `./dist/projectFiles/${projectId}/${file.filename.replace(/\s+/g, '_')}`);
            storedFiles.push(newFilePath);
        }
    }
    return storedFiles;
}

module.exports = { storeFiles };
