const { archiveMultipleFiles } = require('../utils/archiving');
const { moveProjectFile, moveFile } = require('../utils/movingFile');
const { getProject } = require('./getProjects');
const fs = require('fs');

async function storeFiles(filesArr, projectId) {
    try {
        const project = await getProject({"_id": projectId});
        const { tasks } = project;
        let storedFiles = [];
        if(filesArr.length) {
            for(let file of filesArr) {
                const newPath = `./dist/projectFiles/${projectId}/${tasks.length+1}-${file.filename.replace(/\s+/g, '_')}`;
                await moveProjectFile(file, newPath);
                storedFiles.push(newPath);
            }
        }
        return storedFiles;
    } catch(err) {
        console.log(err);
        console.log("Error in storeFiels")
    }
}

async function getDeliverablesLink({taskFiles, projectId, taskId}) {
    try {
        const files = getParsedFiles(taskFiles);
        const outputPath = `./dist/projectFiles/${projectId}/deliverables-${taskId.replace(/\s+/g, '_')}.zip`;
        await archiveMultipleFiles({outputPath, files});
        return outputPath.split("./dist")[1];
    } catch(err) {
        console.log(err);
        console.log("Error in getDeliverablesLink");
    }
}

function getParsedFiles(taskFiles) {
    return taskFiles.reduce((acc, cur) => [...acc, {path: `./dist${cur.path}`, name: cur.fileName}], [])
}

async function manageDeliveryFile({fileData, file}) {
    const { path, taskId, isOriginal, projectId } = fileData;
    const additionFileInfo = `DR-${taskId.replace(/\s+/g, '')}`
    try {
        const newPath = `/projectFiles/${projectId}/${additionFileInfo}-${file.filename.replace(/\s+/g, '_')}`;
        await moveFile(file, `./dist${newPath}`);
        if(path && path !== newPath && isOriginal === "false") {
            fs.unlink(`./dist${path}`, (err) => {
                if(err) throw(err);
                return newPath;
            });
        } else {
            return newPath;
        }
    } catch(err) {
        console.log(err);
        console.log("Error in manageDeliveryFile");
    }
}

module.exports = { storeFiles, getDeliverablesLink, manageDeliveryFile };
