const { archiveMultipleFiles } = require('../utils/archiving');
const { moveFile } = require('../utils/movingFile');
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
                await moveFile(file, newPath);
                storedFiles.push(newPath);
            }
        }
        return storedFiles;
    } catch(err) {
        console.log(err);
        console.log("Error in storeFiels")
    }
}

async function getDeliverablesLink({jobs, projectId, taskId}) {
    try {
        const files = getParsedFiles(jobs);
        const outputPath = `./dist/projectFiles/${projectId}/deliverables-${taskId.replace(/\s+/g, '_')}.zip`;
        await archiveMultipleFiles({outputPath, files});
        return outputPath.split("./dist")[1];
    } catch(err) {
        console.log(err);
        console.log("Error in getDeliverablesLink");
    }
}

function getParsedFiles(jobs) {
    return jobs.reduce((prev, cur) => {
        const filePathParts = cur.targetFile.split("/");
        const fileName = filePathParts.slice(-1)[0];
        const file = {path: `./dist${cur.targetFile}`, name: fileName};
        prev.push(file);
        return [...prev];
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

module.exports = { storeFiles, getDeliverablesLink, storeTargetFile };
