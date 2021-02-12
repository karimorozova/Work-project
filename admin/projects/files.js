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
        if (filesArr && filesArr.length) {
          for (let file of filesArr) {
            const newPath = `./dist/projectFiles/${projectId}/${tasks.length + 1}-${file.filename.replace(/\s+/g, '_')}`;
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
            if(task.status !== 'Cancelled') {
                const { taskId, targetFiles: taskFiles } = task;
                taskDeliverables = task.deliverables || await getDeliverablesLink({taskId, taskFiles, projectId});
                files.push({path: `./dist${taskDeliverables}`, name: taskDeliverables.split("/").pop()});
            }
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
	return taskFiles.reduce((acc, cur) =>
					[...acc,
						{
							path: cur.path.indexOf('./dist') === 0 ?  cur.path : `./dist${cur.path}`,
							name: cur.fileName
						}
					],
			[])
}

async function manageDeliveryFile({fileData, file}) {
    const { path, taskId, isOriginal, projectId } = fileData;
    console.log(path, taskId, isOriginal, projectId)

    const additionFileInfo = `${Math.floor(Math.random()*10000)}DR-${taskId.replace(/\s+/g, '')}`;
    try {
        const newPath = `/projectFiles/${projectId}/${additionFileInfo}-${file.filename.replace(/['"]/g, '_').replace(/\s+/, '_')}`;

        await moveFile(file, `./dist${newPath}`);
        if(!!path && path !== newPath && isOriginal === "false") {
            fs.unlink(`./dist${path}`, (err) => {
                if(err) throw(err);
            });
            return newPath;
        } else {
            return newPath;
        }
    } catch(err) {
        console.log(err);
        console.log("Error in manageDeliveryFile");
    }
}

async function getPdf(allUnits, allSettingsSteps, project, tasksIds = []) {
    try {
        const html = await getPdfOfQuote(allUnits, allSettingsSteps, project, tasksIds);
        var options = { width: '820', height: '900', orientation: "landscape", base: apiUrl };
        return new Promise((resolve, reject) => {
            htmlToPdf.create(html, options).toFile('./dist/uploads/htmlpdf.pdf', function(err, res) {
                if (err) {
                    console.log(err);
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
