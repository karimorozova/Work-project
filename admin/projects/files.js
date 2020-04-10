const { archiveMultipleFiles } = require('../utils/archiving');
const { moveProjectFile, moveFile } = require('../utils/movingFile');
const { getProject } = require('./getProjects');
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

async function getPdf(message) {
    try {
        const htmlWithoutImage = message.split('<img class="logo" src="cid:logo@pan"');
        let html = htmlWithoutImage.join('<img class="logo" src="static/email-logo.png"'); 
        const htmlWithoutWrapper = html.split('<div class="wrapper" style="width:800px;');
        html = htmlWithoutWrapper.join('<div class="wrapper" style="width:600px;'); 
    //     const html = `<div class="wrapper" style="width:600px;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;" >
    //     <header style="background-color:#66563E;text-align:center;" >
    //         <img class="logo" src="static/email-logo.png" alt="pangea" style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;" >
    //     </header>
    //     <div class="main" style="padding-top:40px;padding-bottom:40px;padding-right:40px;padding-left:40px;" >
    //         <h4 class="contact-name">Hello Daniyal</h4>
    //         <p>
    //             Your test was evaluated and received positive feedback
    //             Please review the test results attached.
    //             If you have any comments regarding evaluation, let us know.
    //         </p>
    //         <p>
    //             You will receive shortly email with our offer.
    //         </p>
    //     </div>
    //     <footer>
    //         <hr size="15" color="#66563E">
    //         <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#66563E;" >www.pangea.global</a>
    //     </footer>
    // </div>`;
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
