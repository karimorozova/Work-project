const { archiveMultipleFiles } = require('../utils/archiving');
const { moveProjectFile, moveFile } = require('../utils/movingFile');
const { getProject } = require('./getProjects');
const { getPdfOfQuote } = require("../emailMessages/clientCommunication");
const fs = require('fs');
const htmlToPdf = require('html-pdf');
const apiUrl = require('../helpers/apiurl');

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

async function getProjectDeliverables(project) {
    const { tasks, id: projectId } = project;
    let files = [];
    try {
        for(let task of tasks) {
            const { taskId, targetFiles: taskFiles } = task;
            taskDeliverables = task.deliverables || await getDeliverablesLink({taskId, taskFiles, projectId});
            files.push({path: `./dist${taskDeliverables}`, name: taskDeliverables.split("/").pop()});
        }
        const outputPath = `./dist/projectFiles/${projectId}/project-deliverables.zip`;
        await archiveMultipleFiles({outputPath, files});
        return outputPath.split("./dist")[1];
    } catch(err) {
        console.log(err);
        console.log("Error in getProjectDeliverables");
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

async function getPdf(project) {
    try {
        const html = await getPdfOfQuote(project);
        var options = { format: 'Letter', base: apiUrl };
        return new Promise((resolve, reject) => {
            htmlToPdf.create(html, options).toFile('./dist/uploads/htmlpdf.pdf', function(err, res) {
                if (err) {
                    console.log(err)
                    reject(err);
                }
                resolve('./dist/uploads/htmlpdf.pdf');
              });
        })
    } catch(err) {
        console.log(err);
        console.log("Error in getPdf");
    }
}

module.exports = { storeFiles, getDeliverablesLink, manageDeliveryFile, getProjectDeliverables, getPdf };
