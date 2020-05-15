const { MemoqProject } = require("../models");
const { getLangPairReport } = require("./langPair");
const { getLqaReport } = require("./lqa");

// async function getReport(type, filters) {
//     let date = new Date();
//     date.setMonth(date.getMonth() - 6);
//     try {
//         const projects = await Projects.find({
//             "tasks.service.symbol": "tr", 
//             "tasks.sourceLanguage": "EN-GB", 
//             status: {$ne: "Cancelled"},
//             startDate: {$gt: new Date(date)}
//         }).populate("industry").populate("steps.vendor");
//         let reportData = [];
//         switch(type) {
//             case "langPair":
//                 reportData = await getLangPairReport(projects);
//                 break;
//             case "lqa":
//                 reportData = await getLqaReport(projects, filters);
//                 break;
//         }
//         return reportData;
//     } catch(err) {
//         console.log(err);
//         console.log("Error in getReport");
//     }
// }

async function getReport(type, filters) {
    let date = new Date();
    date.setMonth(date.getMonth() - 6);
    try {
        const projects = await MemoqProject.find({creationTime: {$lt: date}});
        const reportData = getTierReport();
        return reportData;
    } catch(err) {
        console.log(err);
        console.log("Error in getReport");
    }
}

function getTierReport() {
    
}

module.exports = { getReport }