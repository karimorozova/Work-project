const { archiveMultipleFiles } = require('../utils/archiving');
const { moveFile } = require('../utils/movingFile');
const { getRequestOptions } = require('../services/xtmApi');
const fs = require('fs');
const https = require('https');

async function storeFiles(filesArr, projectId) {
    let storedFiles = [];
    if(filesArr.length) {
        for(let file of filesArr) {
            const newPath = `./dist/projectFiles/${projectId}/${file.filename.replace(/\s+/g, '_')}`;
            try {
                await moveFile(file, newPath);
            } catch(err) {
                throw new Error("Error from storeFiels")
            }
            storedFiles.push(newPath);
        }
    }
    return storedFiles;
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
