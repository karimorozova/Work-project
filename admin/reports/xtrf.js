const { XtrfTier, Languages } = require("../models");

async function getXtrfTierReport() {
    const today = new Date();
    let start = new Date(today.getFullYear(), today.getMonth() - 6, -1);
    start.setHours(0, 0, 0, 0);
    try {
        let languages =  await Languages.find();
        languages = languages.map(item => {
            const symbolParts = item.symbol.split("-");
            const symbol = symbolParts.length > 1 ? `${symbolParts[0].toLowerCase()}-${symbolParts[1]}` : item.symbol;
            return `${item.lang} [${symbol}]`
        });
        let reports = await XtrfTier.find({start: {$gte: start}});
        return getParsedReport(reports, languages);
    } catch(err) {
        console.log(err);
        console.log("Error in getXtrfTierReport")
    }
}

function getParsedReport(reports, languages) {
    let result = [];
    for(let lang of languages) {
        const langReport = getLangReport(lang, reports);    
        result.push(langReport);
    }
    return result;
}

function getLangReport(lang, reports) {
    let result = {target: lang};
    result.allTier = getTier(lang, reports, 'All');
    result.financeTier = getTier(lang, reports, 'Finance');
    result.gameTier = getTier(lang, reports, 'Gaming');
    return result;
}

function getTier(lang, reports, industry) {
    let totalWords = 0;
    let totalClients = 0;
    const filteredReports = reports.filter(item => item.industry === industry);
    for(let report of filteredReports) {
        const targetLang = report.languages.find(item => item.target === lang);
        const { wordcount, clients } = targetLang ? getClientsWordcount(targetLang) : {wordcount: 0, clients: 0};
        totalWords += wordcount;
        totalClients += clients;
    }
    return industry === 'All' ? getAllTier(totalWords, totalClients) : getSpecificTier(totalWords, totalClients);
}

function getClientsWordcount(targetLang) {
    const clientsWorcount = Object.keys(targetLang).filter(item => item !== 'target');
    const wordcount = clientsWorcount.reduce((acc, cur) => {
            acc += targetLang[cur];
            return acc;
        }, 0)
    const clients = clientsWorcount.length;
    return { wordcount, clients };
}

function getAllTier(words, clients) {
    let tier = "Tier 2";
    if((words > 55000 && clients > 9) || words > 100000) {
        tier = "Tier 1"
    }
    if(words < 5000 || (words < 10000 && clients < 5))  {
        tier = "Tier 3"
    }
    return tier;
}

function getSpecificTier(words, clients) {
    let tier = "Tier 2";
    if((words > 30000 && clients > 4) || words > 60000) {
        tier = "Tier 1"
    }
    if(words < 2500 || (words < 5000 && clients < 3))  {
        tier = "Tier 3"
    }
    return tier;
}

module.exports = { getXtrfTierReport }