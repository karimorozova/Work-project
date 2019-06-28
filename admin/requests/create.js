const { Requests } = require("../models");
const  { moveFile } = require("../utils/movingFile");
const { sendMail, sendMailClient, sendMailPortal } = require('../utils');
const writeFile = require('write');

async function createNewRequest({requestData, detailFiles, refFiles}) {
    try {
        const request = new Requests(requestData);
        const projectName = request.projectName || "";
        if (requestData.genBrief) {
            await saveGeneralBrief(requestData);
        }
        request.sourceLanguage = JSON.parse(requestData.sourceLanguage);
        request.targetLanguages = JSON.parse(requestData.targetLanguages);
        request.service = JSON.parse(requestData.service);
        request.industry = JSON.parse(requestData.industry);
        const { movedDetailFiles, movedRefFiles } = await storeFiles({detailFiles, refFiles, requestId: request.id});
        request.detailFiles = movedDetailFiles;
        request.refFiles = movedRefFiles;
        await request.save();
        await sendRequestEmails({projectName, request});
    } catch(err) {
        console.log(err);
        console.log("Error in createNewRequest");
    }
}

async function saveGeneralBrief(requestData) {
    let obj = JSON.parse(requestData.genBrief);
    try {
        await writeFile(`./dist/reqfiles/${request.id}/written.txt`, `Package: ${obj.package}
            \nDescription: ${obj.briefDescr};
            \nTargeted Audience: ${obj.briefAudience}; 
            \nTitle: ${obj.briefTitle}; 
            \nTopics: ${obj.briefTopics};
            \nCovered points: ${obj.briefSure};
            \nExamples: ${obj.briefExample}; 
            \nStructure: ${JSON.stringify(obj.structure)};
            \nStyle: ${obj.style}
            \nTone of Voice: ${JSON.stringify(obj.tone)}
            \nDesign: ${JSON.stringify(obj.design)}
            \nSeo: ${JSON.stringify(obj.seo)}
            \nCTA: ${obj.cta}`)
    } catch(err) {
        console.log(err);
        console.log("Error in saveGeneralBrief");
    }
}

async function storeFiles({detailFiles, refFiles, requestId}) {
    const newPath = `./dist/reqfiles/${requestId}/`;
    let movedDetailFiles = [];
    let movedRefFiles = []
    try {
        if (detailFiles) {
            for (let i = 0; i < detailFiles.length; i += 1) {
                await moveFile(detailFiles[i], `${newPath}${detailFiles[i].filename}`);
                movedDetailFiles.push(detailFiles[i].filename);
            }
        }
        if (refFiles) {
            for (let i = 0; i < refFiles.length; i += 1) {
                await moveFile(refFiles[i], `${newPath}${refFiles[i].filename}`);
                movedRefFiles.push(refFiles[i].filename);
            }
        }
        return { movedDetailFiles, movedRefFiles }
    } catch(err) {
        console.log(err);
        console.log("Error in storeFiles");
    }
}

async function sendRequestEmails({projectName, request}) {
    try {
        if (projectName) {
            await sendMailPortal(request);
        } else {
            await sendMail(request);
        }
        await sendMailClient(request);
    } catch(err) {
        console.log(err);
        console.log("Error in sendRequestEmails");
    }
}

module.exports = { createNewRequest }