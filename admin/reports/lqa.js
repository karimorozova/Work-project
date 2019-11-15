const { Languages } = require("../models");

async function getLqaReport(projects) {
    const steps = projects.reduce((acc, cur) => {
        if(cur.steps.length) {
            const stepsWithindustry = cur.steps
                .filter(item => item.vendor && item.serviceStep.symbol === 'translation' && item.sourceLanguage === 'EN-GB')
                .map(item => {
                    item.industry = cur.industry;
                    return item;
                });
            acc.push(...stepsWithindustry);
        }
        return acc;
    }, []);
    const projectLangs = new Set(steps.map(item => item.targetLanguage));
    try {
        const langs = await Languages.find({symbol: {$nin: ["EN", "EN-GB", "EN-US"], $in: [...projectLangs]}});
        return getParsedReport({steps, langs});
    } catch(err) {
        console.log(err);
        console.log("Error in getLqaReport");
    }
}

function getParsedReport({steps, langs}) {
    let reportData = [];
    for(let lang of langs) {
        const langSteps = steps.filter(item => item.targetLanguage === lang.symbol);
        const report = getLangReport(langSteps);
        const key = `${lang.lang} [${lang.symbol}]`;
        reportData.push({ [key]: {...report} })
    }
    return reportData;
}

function getLangReport(langSteps) {
    return langSteps.reduce((acc, cur) => {
        acc[cur.industry.name] = acc[cur.industry.name] || [{vendor: cur.vendor, wordcount: cur.progress.wordsDone}];
        const sameVendorIndex = acc[cur.industry.name].findIndex(item => item.vendor.id === cur.vendor.id);
        if(sameVendorIndex !== -1) {
            acc[cur.industry.name][sameVendorIndex].wordcount += cur.progress.wordsDone;
        } else {
            acc[cur.industry.name].push({
                vendor: cur.vendor,
                wordcount: cur.progress.wordsDone
            })
        }
        return acc;
    }, {})
}

module.exports = { getLqaReport }