const { XtrfTier, XtrfLqa, XtrfReportLang } = require("../models");

//// Tier report /////

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

//// Lqa report /////

async function getXtrfLqaReport(filters) {
    const filterQuery = getFilteringQuery(filters);
    try {
        let reportsFilter = {target: filterQuery.language};
        if(filters.tierFilter) {
            reportsFilter.tierFilter = filters.tierFilter;
        }
        let reports = await getXtrfTierReport(reportsFilter);
        reports = reports.filter(item => item.financeTier.wordcount || item.gameTier.wordcount)
            .map(item => {
                return {
                    target: item.target,
                    finance: item.financeTier.tier,
                    game: item.gameTier.tier
                }
            });
        const lqas = await getFilteredLqas(filterQuery);
        return getFilteredLqaReports({reports, lqas, filters});
    } catch(err) {
        console.log(err);
        console.log("Error in getXtrfLqaReport");
    }
}

function getFilteredLqaReports({reports, lqas, filters}) {
    let result = [];
    for(let report of reports) {
        let finance = lqas.filter(item => {
            let isFit = item.vendor.language.lang === report.target && item.wordcounts.Finance; 
            isFit = isFit && filters.tierFilter ? report.finance === filters.tierFilter : isFit;
            return isFit;
        });
        let gaming = lqas.filter(item => {
            let isFit = item.vendor.language.lang === report.target && item.wordcounts.iGaming;
            isFit = isFit && filters.tierFilter ? report.game === filters.tierFilter : isFit;
            return isFit;
        });
        if(finance.length || gaming.length) {
            if(!filters.industryFilter) {
                result.push({
                    ...report,
                    financeVendors: finance,
                    gamingVendors: gaming
                })
            } else {
                let filteredReport = getFilteredByIndustry({report, finance, gaming, filters});
                result = filteredReport ? [...result, {...filteredReport}] :  result;
            }
        }
    }
    return result;
}

function getFilteredByIndustry({report, finance, gaming, filters}) {
    if(filters.industryFilter === 'Finance' && finance.length) {
        return {
            ...report,
            financeVendors: finance,
            gamingVendors: []
        }
    } else if(filters.industryFilter === 'iGaming' && gaming.length) {
        return {
            ...report,
            financeVendors: [],
            gamingVendors: gaming
        }
    }
}

function getFilteredByTier(report, tierFilter) {

}

function getFilteringQuery(filters) {
    let query = {};
    query["name"] = filters.nameFilter ? {"$regex": new RegExp(`${filters.nameFilter}`, 'i')} : {$ne: null};
    query["language"] = filters.targetFilter ? {$in: filters.targetFilter} : {$nin: []};
    return query;
}

async function getFilteredLqas(query) {
    try {
        return await XtrfLqa.aggregate([
            {
                $lookup: 
                {
                    from: "xtrfvendors",
                    localField: "vendor",
                    foreignField: "_id",
                    as: "vendor"
                }
            },
            {
                $unwind: {
                    path: "$vendor"
                }
            },
            {
                $match: {
                    "vendor.name": query.name
                }
            },
            {
                $lookup: 
                {
                    from: "xtrfreportlangs",
                    localField: "vendor.language",
                    foreignField: "_id",
                    as: "vendor.language"
                }
            },
            {
                $unwind: {
                    path: "$vendor.language"
                }
            },
            {
                $match: {
                    "vendor.language.lang": query.language
                }
            }
        ])
    } catch(err) {
        console.log(err);
        console.log("Error in getFilteredLqas");
    }
}
module.exports = { getXtrfTierReport, getXtrfLqaReport }