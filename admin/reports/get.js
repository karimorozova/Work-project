const { Services } = require("../models");
const { getLangPairReport } = require("./langPair");

async function getReport(type) {
    try {
        const service = await Services.findOne({symbol: "tr"});
        let reportData = [];
        switch(type) {
            case "langPair":
                reportData = await getLangPairReport();
                break;
            case "lqa":
                reportData = await getLqaReport(service.id);
                break;
            default:
                reportData = await getBenchmartReport(service.id);
        }
        return reportData;
    } catch(err) {
        console.log(err);
        console.log("Error in getReport");
    }
}

module.exports = { getReport }