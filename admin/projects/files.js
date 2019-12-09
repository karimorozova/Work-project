const { archiveMultipleFiles } = require('../utils/archiving');
const { moveProjectFile, moveFile } = require('../utils/movingFile');
const { getRequestOptions } = require('../services/xtmApi');
const { getProject } = require('./getProjects');
const fs = require('fs');
const https = require('https');

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

async function getDeliverablesLink({taskFiles, unit, projectId, taskId}) {
    try {
        const files = unit === 'Words' ? getParsedWordcountFiles(taskFiles) : getParsedFiles(taskFiles);
        const outputPath = `./dist/projectFiles/${projectId}/deliverables-${taskId.replace(/\s+/g, '_')}.zip`;
        await archiveMultipleFiles({outputPath, files});
        return outputPath.split("./dist")[1];
    } catch(err) {
        console.log(err);
        console.log("Error in getDeliverablesLink");
    }
}

function getParsedFiles(taskFiles) {
    return taskFiles.reduce((acc, cur) => [...acc, {path: cur.path, name: cur.fileName}], [])
}

function getParsedWordcountFiles(taskFiles) {
    return taskFiles.reduce((acc, cur) => {
        const filePathParts = cur.targetFile.split("/");
        const fileName = filePathParts.slice(-1)[0];
        const file = {path: `./dist${cur.targetFile}`, name: fileName};
        return [...acc, file];
    }, [])
}

async function storeTargetFile({ step, id, projectId, file }) {
    const options = getRequestOptions({
        method: "GET",
        path: `projects/${projectId}/files/${file.fileId}/download?fileType=TARGET`,
    });
    try {
        const fileName = file.fileName.split('.')[0];
        let wstream = fs.createWriteStream(`./dist/projectFiles/${id}/${step.name}-${fileName}.zip`);
        let reqq = https.request(options, (resp) => {
            resp.pipe(wstream);
        });
        reqq.end();
        return new Promise((resolve, reject) => {
            wstream.on('error', err => reject(err));
            wstream.on('finish', async () => {
                resolve({path: `/projectFiles/${id}/${step.name}-${fileName}.zip`});
            })
        })
    } catch(err) {
        console.log(err);
        console.log("Error in storeTargetFile");
    }
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

module.exports = { storeFiles, getDeliverablesLink, storeTargetFile, manageDeliveryFile };
