const { archiveMultipleFiles } = require('../utils/archiving');
const { moveProjectFile, moveFile } = require('../utils/movingFile');
const { getProject, getProjectAfterUpdate } = require('./getProjects');
const { getPdfOfQuote } = require("../emailMessages/clientCommunication");
const fs = require('fs');
const { Projects, Languages } = require('../models')
const htmlToPdf = require('html-pdf');
let  apiUrl = require('../helpers/apiurl');
!apiUrl && (apiUrl = 'https://admin.pangea.global')
const { getCertificateTemplate } = require('../emailMessages/complianceCecertificate')

async function storeFiles(filesArr, projectId) {
    try {
        const project = await getProject({"_id": projectId});
        const { tasks } = project;
        let storedFiles = [];
        if (filesArr && filesArr.length) {
          for (let file of filesArr) {
            const additionFileInfo = `${Math.floor(Math.random()*1000000)}`;
            const newPath = `./dist/projectFiles/${projectId}/${additionFileInfo}-${file.filename.replace(/( *[^\w\.]+ *)+/g, '_')}`;
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
    console.log('IN DEV => getProjectDeliverables')
    // const { tasks, id: projectId } = project;
    // const { tasks: tasksInDelivery } = await Delivery.findOne({ 'projectId' : projectId })
    // let files = [];
    // try {
    //     for(let task of tasks) {
    //         if(task.status !== 'Cancelled') {
    //             const { taskId } = task;
    //             let taskFiles = tasksInDelivery.find(item => item.taskId === taskId).files
    //             let taskDeliverables = task.deliverables || await getDeliverablesLink({taskId, taskFiles, projectId});
    //             files.push({path: `./dist${taskDeliverables}`, name: taskDeliverables.split("/").pop()});
    //         }
    //     }
    //     const outputPath = `./dist/projectFiles/${projectId}/project-deliverables.zip`;
    //     await archiveMultipleFiles({outputPath, files});
    //     return outputPath.split("./dist")[1];
    // } catch(err) {
    //     console.log(err);
    //     console.log("Error in getProjectDeliverables");
    // }
}

// async function getDeliverablesLink({taskFiles, projectId, taskId}) {
    // try {
    //     const files = getParsedFiles(taskFiles);
    //     const outputPath = `./dist/projectFiles/${projectId}/deliverables-${taskId.replace(/\s+/g, '_')}.zip`;
    //     await archiveMultipleFiles({outputPath, files});
    //     return outputPath.split("./dist")[1];
    // } catch(err) {
    //     console.log(err);
    //     console.log("Error in getDeliverablesLink");
    // }
// }

// function getParsedFiles(taskFiles) {
	// return taskFiles.reduce((acc, cur) =>
	// 				[...acc,
	// 					{
	// 						path: cur.path.indexOf('./dist') === 0 ?  cur.path : `./dist${cur.path}`,
	// 						name: cur.fileName
	// 					}
	// 				],
	// 		[])
// }

const createArchiveForDeliverableItem = async ({type, projectId, entityId, user, tasksDR2, tasksDeliverables}) => {
    const outputPath = `/projectFiles/${projectId}/${Math.floor(Math.random()*1000000)}-deliverables.zip`;
    const qProject = { "_id": projectId }

    if (type === 'multi') {
        const { file } = tasksDR2.multiLang.find(({ _id }) => `${ _id }` === `${ entityId }`);
        await archiveMultipleFiles({ outputPath: `./dist${outputPath}`, files: getParsedFiles(file) });
        await setDeliveredStatus('multiLang')

    }
    if (type === 'single') {
        const { files } = tasksDR2.singleLang.find(({ _id }) => `${ _id }` === `${ entityId }`);
        await archiveMultipleFiles({ outputPath: `./dist${outputPath}`, files: getParsedFiles(files) });
        await setDeliveredStatus('singleLang')
    }

    const idx = tasksDeliverables.findIndex(({deliverablesId}) => `${deliverablesId}` === `${entityId}`)
    const newDeliverable = { deliverablesId: entityId, path: outputPath, deliveredBy: user, deliveredAt: new Date() }
    idx === -1 ? tasksDeliverables.push(newDeliverable) : tasksDeliverables.splice(idx, 1, newDeliverable)

    return await getProjectAfterUpdate(qProject, { tasksDeliverables })

    function getParsedFiles(files) {
        return files.reduce((acc, cur) => [ ...acc, { name: cur.fileName, path: cur.path.indexOf('./dist') === 0 ? cur.path : `./dist${ cur.path }` } ], [])
    }

    async function setDeliveredStatus(entity){
        const qEntity = `tasksDR2.${entity}._id`
        const qEntityStatus = `tasksDR2.${entity}.$[i].status`
        const qEntityTime = `tasksDR2.${entity}.$[i].timestamp`
        await Projects.updateOne(
            { ...qProject, [qEntity]: entityId },
            {
                [qEntityStatus]: 'Delivered',
                [qEntityTime]: new Date()
            },
            { arrayFilters: [ { 'i._id': entityId }] }
        )
    }
}

async function manageDeliveryFile({fileData, file}) {
    const { path, projectId } = fileData;

    const additionFileInfo = `${Math.floor(Math.random()*1000000)}`;
    try {
        const newPath = `/projectFiles/${projectId}/${additionFileInfo}-${file.filename.replace(/['"]/g, '_').replace(/\s+/, '_')}`;
        await moveFile(file, `./dist${newPath}`);
        if(!!path && path !== newPath) {
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

const generateAndSaveCertificate = async ({ project, task, deliveryTask }) => {
    const allLanguages = await Languages.find()
    const template = getCertificateTemplate({ project, task, deliveryTask, allLanguages })
    const pdf = new Promise((resolve, reject) => {
        htmlToPdf.create(
            template,
            {
                type: 'pdf',
                width: '814',
                height: '1054',
                orientation: "landscape",
                base: apiUrl,
                border: 0
            })
            .toFile('./dist/uploads/certificatePdf.pdf', function (err, res) {
                if (err) {
                    console.log(err)
                    reject(err)
                }
                resolve('./dist/uploads/certificatePdf.pdf')
            })
    })
    return pdf
    // pdf.then((path) => {
    //     fs.unlink(path.toString(), (err) => {
    //         if (err) console.log(err)
    //     })
    // })
}

const copyProjectFiles = (project, originalFile) => {
    const copiedName = originalFile.path.split("/").pop()
    const additional = `${ Math.floor(Math.random() * 1000000) }-${ copiedName }`
    const newPath = `./dist/projectFiles/${ project._id }/${ additional }`

    fs.copyFile(`./dist/${ originalFile.path }`, newPath, (err) => {
        if (err) throw err
    })

    return newPath
}

module.exports = {
    storeFiles,
    createArchiveForDeliverableItem,
    // getDeliverablesLink,
    copyProjectFiles,
    manageDeliveryFile,
    getProjectDeliverables,
    getPdf,
    generateAndSaveCertificate
};
