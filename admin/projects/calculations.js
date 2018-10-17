const { Projects, Services, Clients, Vendors } = require('../models/');
const { getVendor } = require('../routes/vendors/');
const { getClient } = require('../clients/');
const { getOneService } = require('../services/');
const { getUpdatedProject } = require('./getProjects');

async function metricsCalc(metrics) {
    return new Promise((resolve, reject) => {
        const taskMetrics =  {
            iceMatch: {text: "ICE Match", value: metrics.coreMetrics.iceMatchWords, client: 0.25, vendor: 0.1},
            fuzzyMatch75: {text: "75-84%", value: metrics.coreMetrics.lowFuzzyMatchWords, client: 0.9, vendor: 0.8},
            fuzzyMatch85: {text: "85-94%", value: metrics.coreMetrics.mediumFuzzyMatchWords, client: 0.7, vendor: 0.6},
            fuzzyMatch95: {text: "95-99%", value: metrics.coreMetrics.highFuzzyMatchWords, client: 0.4, vendor: 0.25},
            repeat: {text: "Repetitions", value: metrics.coreMetrics.repeatsWords, client: 0.25, vendor: 0.2},
            leveragedMatch: {text: "Leveraged Match", value: metrics.coreMetrics.leveragedWords, client: 0.25, vendor: 0.2},
            fuzzyRepeats75: {text: "Internal 75-84%", value: metrics.coreMetrics.lowFuzzyRepeatsWords, client: 0.9, vendor: 0.8},
            fuzzyRepeats85: {text: "Internal 85-94%", value: metrics.coreMetrics.mediumFuzzyRepeatsWords, client: 0.7, vendor: 0.6},
            fuzzyRepeats95: {text: "Internal 95-99%", value: metrics.coreMetrics.highFuzzyRepeatsWords, client: 0.4, vendor: 0.25},
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
        const costObj = await calcProofingStep(task, project, task.metrics.totalWords);
        return {cost: costObj.cost, rate: costObj.rate};
    } 
    const metrics = task.metrics;
    const customerCost = await getCustomerRate(task, project.industry.id, project.customer.id);
    const comb = combs.find(item => {
        return item.source.symbol === task.sourceLanguage &&
                item.target.symbol === task.targetLanguage
    });
    const wordCost = comb.industries.find(item => {
        return item.industry.id === project.industry.id
    })
    const { rate } = customerCost || wordCost;
    const cost = calcCost(metrics, 'client', rate, step);
    return {cost: cost, rate: rate};
}

async function payablesCalc(task, project, step) {
    const service = step.name !== "translate1" ? await Services.findOne({"symbol":'pr'}) 
    : await Services.findOne({"_id": task.service});
    const metrics = task.metrics;
    const vendor = await getVendor({"_id": step.vendor._id});
    const comb = getCombination(vendor.languageCombinations, service, task);
    const wordCost = comb ? comb.industry.find(item => {
        return item.industry.id === project.industry.id
    }) : "";
    const rate = wordCost ? wordCost.rate : vendor.basicRate;
    step.payables = step.name !== "translate1" ? (metrics.totalWords*rate).toFixed(2)
    : calcCost(metrics, 'vendor', rate, step);
    step.margin = (step.receivables - step.payables).toFixed(2);
    step.vendorRate = rate;
    return step;
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

async function getCustomerRate(task, industry, customerId) {
    const service = await Services.findOne({"_id": task.service});
    const customer = await getClient({"_id": customerId});
    const comb = getCombination(customer.languageCombinations, service, task);
    const wordCost = comb ? comb.industry.find(item => {
        return item.id === industry
    }) : "";
    return wordCost;
}

async function calcProofingStep(task, project, words) {
    const service = await getOneService({symbol: 'pr'});
    const clientCombs = await getCustomerRate(task, project.industry.id, project.customer.id);
    const comb = service.languageCombinations.find(item => {
        return item.source.symbol === task.sourceLanguage &&
                item.target.symbol === task.targetLanguage
    });
    const wordCost = clientCombs || comb.industries.find(item => {
        return item.industry.id === project.industry.id
    })
    const cost = (words*wordCost.rate).toFixed(2);
    return {cost: cost, rate: wordCost.rate}
}

async function updateProjectCosts(project) {
    project.receivables = project.steps.reduce((init, current) => {
        return +init + +current.receivables
    }, 0).toFixed(2);
    project.payables = project.steps.reduce((init, current) => {
        return +init + +current.payables
    }, 0).toFixed(2);
    return await getUpdatedProject({"_id": project.id}, 
    {steps: project.steps, receivables: project.receivables, payables: project.payables});
}

function getCombination(combs, service, task) {
    return combs.filter(item => {
        return service.languageForm === "Duo" ? item.source : !item.source
    }).find(item => {
        if(service.languageForm === "Duo") {
            return item.source.symbol === task.sourceLanguage &&
                    item.target.symbol === task.targetLanguage &&
                    item.service.id === service._id
            }
        return item.target.symbol === task.targetLanguage &&
        item.service.id === service._id
    })
}

module.exports = { metricsCalc, receivablesCalc, payablesCalc, updateProjectCosts };