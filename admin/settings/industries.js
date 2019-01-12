const { Industries } = require('../models');
const { moveFile } = require('../utils');
const fs = require('fs');

async function createNewIndustry(obj) {
    try {
        const { icon, generic } = await getFilesInfo(obj);
        const { name, active } = obj;
        await Industries.create({icon, name, generic, active});
    } catch(err) {
        console.log(err);
        console.log("Error in createNewIndustry function");
    }
}

async function updateIndustry(obj) {
    const { id, name, active } = obj;
    try {
        const { icon, generic } = await getFilesInfo(obj);
        const industry = await Industries.findById({"_id": id});
        const newIcon = icon ? icon : industry.icon;
        const newGeneric = generic ? generic : industry.generic;
        await Industries.updateOne({"_id": id}, {icon: newIcon, generic: newGeneric, name, active});
    } catch(err) {
        console.log(err);
        console.log("Error in updateIndustry func");
    }
}

async function getFilesInfo(obj) {
    const { iconFile, genericFile } = obj;
    const date = new Date();
    const formattedDate = `${date.getDate()}-${date.getMonth()+1}-${date.getFullYear()}`;
    let icon = "";
    let generic = "";
    try {
        if(iconFile) {
            const newIconPath = `./dist/static/industries/${formattedDate}-${iconFile[0].filename}`;
            await moveFile(iconFile[0], newIconPath);
            icon = `/static/industries/${formattedDate}-${iconFile[0].filename}`;
        }
        if (genericFile) {
            const newGenericPath = `./dist/static/industries/exel/${formattedDate}-${genericFile[0].filename}`;
            await moveFile(genericFile[0], newGenericPath);
            generic = `/static/industries/exel/${formattedDate}-${genericFile[0].filename}`;
        }
        return { icon, generic };
    } catch(err) {
        console.log(err);
        console.log("Error in getFilesInfo function");
    }
}

async function deleteIndustryFiles(icon, generic) {
    try {
        if(icon) await fs.unlink(`./dist${icon}`, (err) => { if(err) console.log(err)});
        if(generic) await fs.unlink(`./dist${generic}`, (err) => { if(err) console.log(err)});
    } catch(err){
        console.log(err);
        console.log('Error in deleteIndustryFiles func');
    }
}

module.exports = { createNewIndustry, updateIndustry, deleteIndustryFiles };
