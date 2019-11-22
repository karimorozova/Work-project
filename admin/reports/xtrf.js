const { XtrfTier, XtrfReportLang } = require("../models");

async function getXtrfTierReport(filters) {
    const today = new Date();
    let start = new Date(today.getFullYear(), today.getMonth() - 6, -1);
    start.setHours(0, 0, 0, 0);
    try {
        const filterQuery = filters.targetFilter ? {lang: {$in: filters.targetFilter}} : {};
        const languages = await XtrfReportLang.find(filterQuery);
        let reports = await XtrfTier.find({start: {$gte: start}});
        let result = getParsedReport(reports, languages);
        if(filters.tierFilter) {
            result = result.filter(item => {
                return item.allTier.tier === filters.tierFilter 
                    || item.financeTier.tier === filters.tierFilter
                    || item.gameTier.tier === filters.tierFilter
            })
        }
        return result;
    } catch(err) {
        console.log(err);
        console.log("Error in getXtrfTierReport")
    }
}

function getParsedReport(reports, languages) {
    let result = [];
    for(let { lang } of languages) {
        const langReport = getLangReport(lang, reports);    
        result.push(langReport);
    }
    result = result.sort((a,b) => a.target > b.target ? 1 : -1);
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
        const targetLang = report.languages.find(item => Object.keys(item)[0] === lang);
        const { wordcount, clients } = targetLang ? getClientsWordcount(targetLang) : {wordcount: 0, clients: 0};
        totalWords += wordcount;
        totalClients += clients;
    }
    return industry === 'All' ? getAllTier(totalWords, totalClients) : getSpecificTier(totalWords, totalClients);
}

function getClientsWordcount(targetLang) {
    const clientsWords = targetLang[Object.keys(targetLang)[0]];
    const wordcount = Object.keys(clientsWords).reduce((acc, cur) => {
            acc += clientsWords[cur];
            return acc;
        }, 0)
    const clients = Object.keys(clientsWords).length;
    return { wordcount, clients };
}

function getAllTier(wordcount, clients) {
    let tier = 2;
    if((wordcount > 55000 && clients > 9) || wordcount > 100000) {
        tier = 1;
    }
    if(wordcount < 5000 || (wordcount < 10000 && clients < 5))  {
        tier = 3;
    }
    return {tier, wordcount, clients};
}

function getSpecificTier(wordcount, clients) {
    let tier = 2;
    if((wordcount > 30000 && clients > 4) || wordcount > 60000) {
        tier = 1;
    }
    if(wordcount < 2500 || (wordcount < 5000 && clients < 3))  {
        tier = 3;
    }
    return {tier, wordcount, clients};
}

module.exports = { getXtrfTierReport }