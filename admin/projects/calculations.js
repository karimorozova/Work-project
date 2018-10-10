const { Projects, Services, Clients, Vendors } = require('../models/');
const { getVendor } = require('../routes/vendors/');
const { getClient } = require('../clients/');
const { getOneService } = require('../services/');

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

async function receivablesCalc(task, project, step, combs) {
    if(step.name !== "translate1") {
        return await calcProofingStep(task, project, task.metrics.totalWords);
    } 
    const metrics = task.metrics;
    const customerCost = await checkCustomerCombs(task, project.industry.id, project.customer.id);
    const comb = combs.find(item => {
        return item.source.symbol === task.sourceLanguage &&
                item.target.symbol === task.targetLanguage
    });
    const wordCost = comb.industries.find(item => {
        return item.industry.id === project.industry.id
    })
    const { rate } = customerCost || wordCost;
    return calcCost(metrics, 'client', rate, step)
}

async function payablesCalc(task, project, step) {
    const service = step.name !== "translate1" ? 'Proofing' : task.service;
    const metrics = task.metrics;
    const vendor = await getVendor({"_id": step.vendor._id});
    const comb = vendor.languageCombinations.find(item => {
        return item.source.symbol === task.sourceLanguage &&
        item.target.symbol === task.targetLanguage &&
        item.service.id === service
    });
    const wordCost = comb ? comb.industry.find(item => {
        return item.industry.id === project.industry.id
    }) : "";
    const rate = wordCost ? wordCost.rate : vendor.basicRate;
    return step.name !== "translate1" ? (metrics.totalWords*rate).toFixed(2)
        : calcCost(metrics, 'vendor', rate, step);
}

function calcCost(metrics, field, rate) {
    let cost = 0;
    let wordsSum = 0;
    for(let key in metrics) {
        if(key != 'totalWords' && key != "nonTranslatable" && key != "__proto__") {
            cost+= metrics[key].value*metrics[key][field]*rate;
            wordsSum += metrics[key].value;
        }
    }
    cost += (metrics.totalWords - metrics.nonTranslatable - wordsSum)*rate;
    return cost.toFixed(2);
}

async function checkCustomerCombs(task, industry, customerId) {
    const customer = await getClient({"_id": customerId});
    const comb = customer.languageCombinations.find(item => {
        return item.source.symbol === task.sourceLanguage &&
                item.target.symbol === task.targetLanguage &&
                item.service.id === task.service
    })
    const wordCost = comb ? comb.industry.find(item => {
        return item.id === industry
    }) : "";
    return wordCost;
}

async function calcProofingStep(task, project, words) {
    const service = await getOneService({title: 'Proofing'});
    const clientCombs = await checkCustomerCombs(task, project.industry.id, project.customer.id);
    const comb = service.languageCombinations.find(item => {
        return item.source.symbol === task.sourceLanguage &&
                item.target.symbol === task.targetLanguage
    });
    const wordCost = clientCombs || comb.industries.find(item => {
        return item.industry.id === project.industry.id
    })
    return (words*wordCost.rate).toFixed(2);
}

module.exports = { metricsCalc, receivablesCalc, payablesCalc };