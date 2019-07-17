const { Vendors, Languages } = require("../models");
const { moveFile, sendEmail, applicationMessage } = require("../utils");
const fs = require("fs");

async function manageNewApplication({person, cvFiles, coverLetterFiles}) {
    try {
        let vendor = await Vendors.create({...person, status: "Potential"});
        vendor.cvFiles = await manageFiles(cvFiles, vendor.id, 'cvFile');
        vendor.coverLetterFiles = await manageFiles(coverLetterFiles, vendor.id, 'coverLetterFile');
        const parsedPersondata = getParsedData(person);
        vendor.languagePairs = parsedPersondata.languagePairs;
        vendor.industries = parsedPersondata.industries;
        await vendor.save();
        await sendEmailToManager(parsedPersondata, vendor)
    } catch(err) {
        console.log(err);
        console.log("Error in manageNewApplication");
    }
}

async function sendEmailToManager(personData, vendor) {
    let emailData = {...personData};
    try {
        emailData.to = "career@pangea.global";
        emailData.subject = `Application form ${emailData.firstName} ${emailData.surname}`;
        const motherTongue = await Languages.find({"_id": emailData.native});
        emailData.native = motherTongue[0].lang;
        emailData.languagePairs = await getLanguagePairs(personData.languagePairs);
        emailData.cvFiles = [...vendor.cvFiles];
        emailData.coverLetterFiles = [...vendor.coverLetterFiles];
        emailData.attachments = getFilesAttachments([...emailData.cvFiles, ...emailData.coverLetterFiles]);
        const message = applicationMessage(emailData);
        await sendEmail(emailData, message);
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

async function getLanguagePairs(languagePairs) {
    let pairs = [];
    for(let lang of languagePairs) {
        let source = await Languages.findOne({"_id": lang.source});
        let target = await Languages.findOne({"_id": lang.target});
        pairs.push({source: source.symbol, target: target.symbol})
    }
    return pairs;
}

async function manageFiles(files, vendorId, prop) {
    let paths = [];
    try {
        if(files.length) {
            let counter = 1
            for(let file of files) {
                    let newFileName = `${prop}${counter}_${file.filename.replace(/\s+/g, '_')}`;
                    const path = `/application/${vendorId}/${newFileName}`;
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