const { Services } = require('../models');
const { moveFile } = require('../utils');
const fs = require('fs');

async function createNewService(obj) {
    try {
        const { title, active, languageForm, steps } = obj;
        await Services.create({
            title, active, languageForm, steps
        });
    } catch(err) {
        console.log(err);
        console.log("Error in createNewService function");
    }
}

async function updateService(obj) {
    const { id, title, active, languageForm,  steps } = obj;
    try {
        // const service = await Services.findById({"_id": id});
        await Services.updateOne({"_id": id},
            {title, active, languageForm, steps});
    } catch(err) {
        console.log(err);
        console.log("Error in updateService func");
    }
}

async function getFilesInfo(obj) {
    const { iconFile } = obj;
    const date = new Date();
    const formattedDate = `${date.getDate()}-${date.getMonth()+1}-${date.getFullYear()}`;
    let icon = "";
    try {
        if(iconFile) {
            const newIconPath = `./dist/services/${formattedDate}-${iconFile[0].filename}`;
            await moveFile(iconFile[0], newIconPath);
            icon = `/services/${formattedDate}-${iconFile[0].filename}`;
        }
        return icon;
    } catch(err) {
        console.log(err);
        console.log("Error in getFilesInfo function");
    }
}

async function deleteServiceIcon(icon) {
    try {
        if(icon) await fs.unlink(`./dist${icon}`, (err) => { if(err) console.log(err)});
    } catch(err){
        console.log(err);
        console.log('Error in deleteServiceIcon func');
    }
}

module.exports = { createNewService, updateService, deleteServiceIcon };