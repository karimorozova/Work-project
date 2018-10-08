const { Projects, Services, Clients, Vendors } = require('../models/');

async function metricsCalc(metrics) {
    return new Promise((resolve, reject) => {
        const taskMetrics =  {
            iceMatch: {value: metrics.coreMetrics.iceMatchWords, client: 0.025, vendor: 0.01},
            fuzzyMatch75: {value: metrics.coreMetrics.lowFuzzyMatchWords, client: 0.09, vendor: 0.08},
            fuzzyMatch85: {value: metrics.coreMetrics.mediumFuzzyMatchWords, client: 0.07, vendor: 0.06},
            fuzzyMatch95: {value: metrics.coreMetrics.highFuzzyMatchWords, client: 0.04, vendor: 0.025},
            repeat: {value: metrics.coreMetrics.repeatsWords, client: 0.03, vendor: 0.02},
            leveragedMatch: {value: metrics.coreMetrics.leveragedWords, client: 0.03, vendor: 0.02},
            fuzzyRepeats75: {value: metrics.coreMetrics.lowFuzzyRepeatsWords, client: 0.09, vendor: 0.08},
            fuzzyRepeats85: {value: metrics.coreMetrics.mediumFuzzyRepeatsWords, client: 0.07, vendor: 0.06},
            fuzzyRepeats95: {value: metrics.coreMetrics.highFuzzyRepeatsWords, client: 0.04, vendor: 0.025},
            nonTranslatable: metrics.coreMetrics.nonTranslatableWords,
            totalWords: metrics.coreMetrics.totalWords,
        }     
        const progress = {};
        for(const key in metrics.metricsProgress) {
            progress[key] = {
                wordsTotal: metrics.metricsProgress[key].totalWordCount,
                wordsToBeDone: metrics.metricsProgress[key].wordsToBeDone,
                wordsDone: metrics.metricsProgress[key].wordsDone,
                wordsToBeChecked: metrics.metricsProgress[key].wordsToBeChecked,
                wordsToBeCorrected: metrics.metricsProgress[key].wordsToBeCorrected,
            }
        }
        resolve({metrics: taskMetrics, progress: progress});
    })
}

async function receivablesCalc(task, industry, combs) {
    const metrics = task.metrics;
    const comb = combs.find(item => {
        return item.source.symbol === task.sourceLanguage &&
                item.target.symbol === task.targetLanguage
    });
    const cost = comb.industries.find(item => {
        return item.industry.id === industry
    })
    return new Promise((resolve, reject) => {
        let receivables = 0;
        let wordsSum = 0;
        for(let key in metrics) {
            if(key != 'totalWords' && key != "nonTranslatable" && key != "__proto__") {
                receivables+= metrics[key].value*metrics[key].client*cost.rate;
                wordsSum += metrics[key].value;
            }
        }
        receivables += (metrics.totalWords - metrics.nonTranslatable - wordsSum)*cost.rate;
        resolve(receivables.toFixed(3));
    })
}

module.exports = { metricsCalc, receivablesCalc };