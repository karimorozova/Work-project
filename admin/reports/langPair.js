const { Languages, Industries } = require("../models");

async function getLangPairReport(projects) {
    const finance = ["CFDs & Online Trading", "ICOs & Cryptocurrency"];
    const gaming = ["Poker", "Video Games", "iGaming"];
    try {
        const langs = await Languages.find({symbol: {$nin: ["EN", "EN-GB", "EN-US"]}});
        const financeIndustries = await Industries.find({name: {$in: finance}});
        const gameIndustries = await Industries.find({name: {$in: gaming}});
        return getParsedReport({langs, projects, financeIndustries, gameIndustries});
    } catch(err) {
        console.log(err);
        console.log("Error in getLangPairReport");
    } 
}

function getParsedReport({langs, projects, financeIndustries, gameIndustries}) {
    let reportData = [];
    for(let lang of langs) {
        const {allWordcount, clients: allClients} = getWordcountAndClients({projects, lang});
        const {finWordcount, clients: finClients} = getWordcountAndClients({projects, lang, industries: financeIndustries});
        const {gameWordcount, clients: gameClients} = getWordcountAndClients({projects, lang, industries: gameIndustries});
        const allTier = getTier(allWordcount, allClients.length);
        const financeTier = getTier(finWordcount, finClients.length);
        const gameTier = getTier(gameWordcount, gameClients.length);
        reportData.push({
            target: `${lang.lang} [${lang.symbol}]`,
            allTier,
            financeTier,
            gameTier
        })
    }
    return reportData;
}

function getWordcountAndClients({projects, lang, industries}) {
    let clients = [];
    const industriesIds = industries ? industries.map(item => item.id) : [];
    const filteredProjects = industriesIds.length ? projects.filter(item => industriesIds.indexOf(item.industry.id) !== -1) : projects;
    const wordcount = filteredProjects.reduce((acc, cur) => {
        if(clients.indexOf(cur.customer) === -1) {
            clients.push(cur.customer);
        }
        const steps = cur.steps.filter(step => {
            return step.serviceStep.symbol === 'translation' && step.sourceLanguage === 'EN-GB' && step.targetLanguage === lang.symbol
        }).map(item => item.progress.wordsDone);
        acc += steps.reduce((a, b) => a + b, 0);
        return acc;
    }, 0)
    return { wordcount, clients }
}

function getTier(words, clients) {
    let tier = "Tier 2";
    if(words > 55000 && clients > 9) {
        tier = "Tier 1"
    }
    if(words < 10000 && clients < 5) {
        tier = "Tier 3"
    }
    return tier;
}

module.exports = { getLangPairReport }