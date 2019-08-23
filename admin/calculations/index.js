const { Services, Vendors } = require('../models');
const { getVendor, getVendors } = require('../vendors/getVendors');
const { getClient } = require('../clients/getClients');
const { getOneService } = require('../services/getServices');
const { updateProject } = require('../projects/getProjects');
const { emptyMetrics } = require('../helpers/dbDefaultValue');

async function metricsCalc(metrics) {
    if(!metrics) {
        return {xtmMetrics: emptyMetrics, progress: {'invalid': {}, jobsMetrics: []}};
    }
    return new Promise((resolve, reject) => {
        const xtmMetrics =  getFilledXtmMetrics(metrics);
        let progress = {};
        for(const key in metrics.metricsProgress) {
            progress[key] = {
                wordsTotal: metrics.metricsProgress[key].totalWordCount,
                wordsToBeDone: metrics.metricsProgress[key].wordsToBeDone,
                wordsDone: metrics.metricsProgress[key].wordsDone,
                wordsToBeChecked: metrics.metricsProgress[key].wordsToBeChecked,
                wordsToBeCorrected: metrics.metricsProgress[key].wordsToBeCorrected,
            }
        }
        progress.jobsMetrics = [...metrics.jobsMetrics];
        resolve({xtmMetrics, progress});
    })
}

function getFilledXtmMetrics(metrics) {
    return {
        iceMatch: {text: "ICE Match", value: metrics.coreMetrics.iceMatchWords},
        fuzzyMatch75: {text: "75-84%", value: metrics.coreMetrics.lowFuzzyMatchWords},
        fuzzyMatch85: {text: "85-94%", value: metrics.coreMetrics.mediumFuzzyMatchWords},
        fuzzyMatch95: {text: "95-99%", value: metrics.coreMetrics.highFuzzyMatchWords},
        repeat: {text: "Repetitions", value: metrics.coreMetrics.repeatsWords},
        leveragedMatch: {text: "Leveraged Match", value: metrics.coreMetrics.leveragedWords},
        fuzzyRepeats75: {text: "Internal 75-84%", value: metrics.coreMetrics.lowFuzzyRepeatsWords},
        fuzzyRepeats85: {text: "Internal 85-94%", value: metrics.coreMetrics.mediumFuzzyRepeatsWords},
        fuzzyRepeats95: {text: "Internal 95-99%", value: metrics.coreMetrics.highFuzzyRepeatsWords},
        nonTranslatable: metrics.coreMetrics.nonTranslatableWords,
        totalWords: metrics.coreMetrics.totalWords,
    }
}

function taskMetricsCalc({metrics, matrix, prop}) {
    let taskMetrics = {...metrics};
    for(let key in matrix) {
        taskMetrics[key][prop] = matrix[key].rate;
    }
    return taskMetrics;
}

async function updateTaskMetrics(metrics, vendorId) {
    try {
        const vendor = await Vendors.findOne({"_id": vendorId});
        const matrix = {...vendor.matrix};
        const updatedMetrics = taskMetricsCalc({metrics, matrix, prop: 'vendor'});
        return updatedMetrics
    } catch(err) {
        console.log(err);
        console.log("Error in updateTaskMetrics");
    }
}

async function receivablesCalc({task, project, step}) {
    try {
        if(step.serviceStep.symbol !== "translation") {
            const { cost, rate } = await calcProofingStep({step, task, project, words: task.metrics.totalWords});
            return {cost, rate};
        } 
        const metrics = task.metrics;
        const rate = await getCustomerRate({step, industryId: project.industry.id, customerId: project.customer.id, task});;
        const cost = calcCost(metrics, 'client', rate).toFixed(2);
        return { cost: +cost, rate };
    } catch(err) {
        console.log(err);
        console.log("Error in receivablesCalc");
    }
}

async function getAfterPayablesUpdated({projectId, step, index}) {
    try {
        const queryStr = `steps.${index}`;
        let project = await updateProject({"_id": projectId}, {$set: {[queryStr]: step}});
        let { tasks, steps } = project;
        const taskIndex = tasks.findIndex(item => item.taskId == step.taskId);
        const stepIndex = steps.findIndex(item => item.taskId == step.taskId && item.name === step.name);
        tasks[taskIndex].metrics = await updateTaskMetrics(tasks[taskIndex].metrics, step.vendor._id);
        steps[stepIndex] = await payablesCalc({task: tasks[taskIndex], project, step});
        tasks[taskIndex].finance.Price.payables = +(steps.filter(item => item.taskId === tasks[taskIndex].taskId)
        .reduce((prev, cur) => prev + +cur.finance.Price.payables, 0).toFixed(2));
        return await updateProjectCosts({...project._doc, id: projectId, tasks, steps});
      } catch(err) {
        console.log(err);
        console.log('Error in getAfterPayablesUpdated');
      }
}

async function payablesCalc({task, project, step}) {
    try {
        const vendor = await getVendor({"_id": step.vendor._id});
        const rate = getRate({step, project, vendor});
        const { metrics } = task;
        return getStepPayables({rate, metrics, step});
    } catch(err) {
        console.log(err);
        console.log("Error in payablesCalc");
    }
}

function getStepPayables({rate, metrics, step}) {
    let { finance } = step;
    const payables = step.name !== "translate1" ? +(metrics.totalWords*rate)
    : calcCost(metrics, 'vendor', rate);
    finance.Price.payables = +(payables.toFixed(2));
    return {...step, finance, vendorRate: rate};
}

function getRate({step, project, vendor}) {
    try {
        const comb = getCombination({combs: vendor.wordsRates, step, industryId: project.industry.id});
        const rate = comb ? comb.rates[step.serviceStep._id] : "";
        const basicRate = vendor.basicRate ? +vendor.basicRate : 0;
        return rate && rate.value ? +rate.value : +basicRate;
    } catch(err) {
        console.log(err);
        console.log("Error in getRate");
    }
}

function calcCost(metrics, field, rate) {
    let cost = 0;
    let wordsSum = 0;
    for(let key in metrics) {
        if(key !== 'totalWords' && key !== "nonTranslatable") {
            cost+= metrics[key].value*metrics[key][field]*rate;
            wordsSum += metrics[key].value;
        }
    }
    cost += (metrics.totalWords - metrics.nonTranslatable - wordsSum)*rate;
    return cost;
}

async function getCustomerRate({step, industryId, customerId}) {
    try {
        const customer = await getClient({"_id": customerId});
        const comb = getCombination({combs: customer.wordsRates, step, industryId});
        const rate = comb ? comb.rates[step.serviceStep._id] : "";
        const customerRate = rate ? rate.value : "";
        return customerRate;
    } catch(err) {
        console.log(err);
        console.log("Error in getCustomerRate");
    }
}

function getCombination({combs, step, industryId}) {
    const filtered = combs.filter(item => {
        if(step.serviceStep.calcualtionUnit !== 'Packages') {
        return item.source.symbol === step.source &&
                    item.target.symbol === step.target
        }
        return item.target.symbol === step.target &&
        item.packageSize === step.packageSize
    })
    return filtered.find(item => {
        const index = item.industries.findIndex(indus => indus.id === industryId);
        return index !== -1;
    })
}

async function calcProofingStep({step, task, project, words}) {
    try {
        const rate = await getCustomerRate({task, step, industryId: project.industry.id, customerId: project.customer.id});
        const cost = +(words*rate).toFixed(2);
        return { cost, rate }
    } catch(err) {
        console.log(err);
        console.log('Error in calcProofingStep');
    }
}

async function setDefaultStepVendors(project) {
    try {
        let { steps, tasks } = project;
        const vendors = await getVendors();
        for(let i = 0; i < steps.length; i++) {
            let taskIndex = tasks.findIndex(item => item.taskId === steps[i].taskId);
            let activeVendors = vendors.filter(item => item.status === "Active");
            let matchedVendors = await getMatchedVendors({activeVendors, step: steps[i], project})
            if(matchedVendors.length === 1 && !steps[i].vendor) {
                steps[i].vendor = {...matchedVendors[0], _id: matchedVendors[0].id};
                tasks[taskIndex].metrics = await updateTaskMetrics(tasks[taskIndex].metrics, matchedVendors[0].id);            
                steps[i] = await payablesCalc({task: tasks[taskIndex], project, step: steps[i]._doc});
                tasks[taskIndex].finance.Price.payables = +(tasks[taskIndex].finance.Price.payables+steps[i].finance.Price.payables).toFixed(2);
            }
        }
        return { steps, tasks };
    } catch(err) {
        console.log(err);
        console.log("Error in setDefaultStepVendors");
    }
}

async function getMatchedVendors({activeVendors, step, project}) {
    let matchedVendors = [];
    try {
        for(let vendor of activeVendors) {
            const isMatching = checkForLanguages({vendor, step, project});
            if(isMatching) {
                matchedVendors.push(vendor);
            }
        }
        return matchedVendors;
    } catch(err) {
        console.log(err);
        console.log("Error in getMatchedVendors");
    }
}

function checkForLanguages({vendor, step, project}) {
    return vendor.wordsRates.find(item => {
        if(item.source && item.source.symbol === step.source && 
            item.target.symbol === step.target) {
                return hasRateValue({
                        step, 
                        pair: item, 
                        stepIndustry: project.industry.id
                    });
        }
    })
}

function hasRateValue({step, pair, stepIndustry}) {
    const index = pair.industries.findIndex(item => item.id === stepIndustry);
    if(index === -1) {
        return false;
    }
    return pair.rates[step.serviceStep._id];
}

async function updateProjectCosts(project) {
    let receivables = +project.tasks.reduce((prev, current) => {
        return +prev + +current.finance['Price'].receivables
    }, 0).toFixed(2);
    const payables = +project.tasks.reduce((prev, current) => {
        return +prev + +current.finance['Price'].payables
    }, 0).toFixed(2);
    let finance = {};
    finance['Wordcount'] = getWordsData(project);
    finance['Price'] = {'receivables': receivables, 'payables': payables};
    let discount = {};
    if(project.finance['Discount']) {
        discount = {...project.finance['Discount']};
        discount.receivables = (receivables/100*discount.value).toFixed(2);
        finance['Price'].receivables -= discount.receivables;
        finance['Discount'] = discount;
    }
    try {
        return await updateProject({"_id": project.id}, { ...project, finance });
    } catch(err) {
        console.log(err);
        console.log("Error in updateProjectCosts");
    }
}

function getWordsData(project) {
    let receivableWords = 0;
    let payableWords = 0;
    for(const task of project.tasks) {
        if(task.metrics) {
            const taskPayableWords = wordsCalculation(task);
            receivableWords += task.metrics.totalWords - task.metrics.nonTranslatable;
            payableWords += task.metrics.totalWords - task.metrics.nonTranslatable - taskPayableWords;
        }
    }
    return {'receivables': receivableWords, 'payables': payableWords}
}

function  wordsCalculation(task) {
    const excludeKeys = ["nonTranslatable", "totalWords"]
    const words = Object.keys(task.metrics).filter(item => {
        return excludeKeys.indexOf(item) === -1;
    }).reduce((prev, cur) => {
        return prev + task.metrics[cur].value;
    }, 0)
    return words;
}

module.exports = { metricsCalc, receivablesCalc, payablesCalc, setDefaultStepVendors, 
    updateProjectCosts, calcCost, updateTaskMetrics, taskMetricsCalc, getAfterPayablesUpdated };