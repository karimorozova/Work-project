const { Vendors, Languages } = require("../models");
const { moveFile, sendEmail, sendFlexibleEmail } = require("../utils");
const { applicationMessage,vendorRegistration } = require("../emailMessages/vendorCommunication");
const fs = require("fs");
const passwordGen = require("generate-password")
const { getVendorAfterUpdate } = require('../vendors/getVendors')
const bcrypt = require('bcryptjs');

async function manageNewApplication({person, cvFiles, coverLetterFiles, infoForMail}) {

    const allVendors = await Vendors.find()
    if(allVendors.map(i => i.email).includes(person.email)) return
    const catExperience = JSON.parse(person['parsing-catExperience'])
    const pendingCompetencies = JSON.parse(person['pendingCompetencies'])
    try {
        const lastIndex = await Vendors.findOne().sort({ 'vendorId': -1 }) ||  false
        let lastIntIndex = lastIndex.toJSON().hasOwnProperty('vendorId') ? parseInt(lastIndex.vendorId.split('_').pop()) : 0
        person.vendorId = 'VEN_' + (++lastIntIndex + '').padStart(6, "0")

        let vendor = await Vendors.create({...person, pendingCompetencies, catExperience, status: "Potential"});
        vendor.documents = await setDocuments(cvFiles, 'Resume', vendor.id);
        vendor.coverLetterFiles = await manageFiles(coverLetterFiles, vendor.id, 'coverLetterFile');
        const mailPassword = passwordGen.generate({ length: 8, numbers: true })
        vendor.password = await bcrypt.hash(mailPassword, 10)
        const updatedVendor = await getVendorAfterUpdate({_id: vendor._id}, vendor)

        const parsedPersonData = getParsedData(person);
        await sendEmailToManager("translation@pangea.global","career@pangea.global",  parsedPersonData, updatedVendor, infoForMail)
        await sendEmailToVendor("career@pangea.global", updatedVendor, mailPassword)
    } catch(err) {
        console.log(err);
        console.log("Error in manageNewApplication");
    }
}

async function sendEmailToManager(from, to, personData, vendor, infoForMail) {
    let emailData = {...personData};
    try {
        emailData.to = to;
        emailData.from = from;
        emailData.subject = `Application from ${emailData.firstName} ${emailData.surname}`;

        emailData.cvFiles = vendor.documents
            .filter(({category}) => category === 'Resume' )
            .map(({category, path}) => { if(category === 'Resume') return path})

        emailData.coverLetterFiles = vendor.coverLetterFiles;
        emailData.attachments = getFilesAttachments([...emailData.cvFiles, ...emailData.coverLetterFiles]);
        emailData.phone = vendor.phone

        const message = applicationMessage(emailData, infoForMail);
        await sendFlexibleEmail(emailData, message);
    } catch(err) {
        console.log(err);
        console.log("Error in sendEmailToManager");
    }
}

async function sendEmailToVendor(from, vendor, pass) {
    const emailData = {firstName: vendor.firstName, surname: vendor.surname, email: vendor.email, textEmail: vendor.email , pass}
    try {
        emailData.to = emailData.email;
        emailData.from = from;
        emailData.subject = `Application from ${emailData.firstName} ${emailData.surname}`;
        const message = vendorRegistration(emailData);
        await sendFlexibleEmail(emailData, message);
    } catch(err) {
        console.log(err);
        console.log("Error in sendEmailToManager");
    }
}
function getFilesAttachments(files) {
    return files.reduce((prev, cur) => {
        const filename = cur.split("/").pop();
        const content = fs.createReadStream(`./dist${cur}`);
        prev.push({filename, content});
        return [...prev];
    }, [])
}

function getParsedData(person) {
    return Object.keys(person).reduce((prev, cur) => {
        const newKey = cur.split('-')[1];
        const check = cur.split('-')[0];
        if(check === "parsing") {
            prev[newKey] = JSON.parse(person[cur]);
        } else {
            prev[cur] = person[cur];
        }
        return prev;
    }, {});
}

async function setDocuments(cvFiles, docCategory, subDir) {
    let defaultDocuments = [
        {
            fileName: '',
            category: 'NDA',
            path: '1',
        },
        {
            fileName: '',
            category: 'Contract',
            path: '2',
        }
    ]
    if(cvFiles.length) {
        let counter = 1
        for await (let file of cvFiles) {
            let newFileName = `cvFile${counter}_${file.filename.replace(/\s+/g, '_')}`;
            const path = `/vendorsDocs/${subDir}/${newFileName}`;
            await moveFile(file, `./dist${path}`);

            const fileName = file.filename
            defaultDocuments.push({ fileName, category: docCategory, path })
            counter++;
        }
    }
    return defaultDocuments
}


async function manageFiles(files, vendorId, prop) {
    let paths = [];
    try {
        if(files.length) {
            let counter = 1
            for await (let file of files) {
                    let newFileName = `${prop}${counter}_${file.filename.replace(/\s+/g, '_')}`;
                    const path = `/vendorsDocs/${vendorId}/${newFileName}`;
                    await moveFile(file, `./dist${path}`);
                    paths.push(path);
                    counter++;
            }
        }
        return paths;
    } catch(err) {
        console.log(err);
        console.log("Error in manageFiles");
    }
}

module.exports = { manageNewApplication };
