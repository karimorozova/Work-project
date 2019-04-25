const { Projects, Services, Clients, Vendors } = require('../models');
const { getVendor, getVendors } = require('../routes/vendors/getVendors');
const { getClient } = require('../clients/getClients');
const { getOneService } = require('../services/getServices');
const { updateProject } = require('./getProjects');

async function metricsCalc(metrics) {
    return new Promise((resolve, reject) => {
        const xtmMetrics =  {
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
        resolve({xtmMetrics, progress});
    })
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
        if(step.name !== "translate1") {
            const { cost, rate } = await calcProofingStep({task, project, words: task.metrics.totalWords});
            return {cost, rate};
        } 
        const metrics = task.metrics;
        const rate = await getCustomerRate({task, industry: project.industry.id, customerId: project.customer.id});;
        const cost = calcCost(metrics, 'client', rate);
        return { cost, rate };
    } catch(err) {
        console.log(err);
        console.log("Error in receivablesCalc");
    }
}

async function payablesCalc({task, project, step}) {
    try {
        const service = step.name !== "translate1" ? await Services.findOne({"symbol":'pr'}) 
        : await Services.findOne({"_id": task.service});
        const metrics = task.metrics;
        const vendor = await getVendor({"_id": step.vendor._id});
        const comb = getCombination({combs: vendor.languageCombinations, service, task});
        const rateIndustry = comb ? comb.industries.find(item => {
            return item.industry.id === project.industry.id
        }) : "";
        const basicRate = vendor.basicRate ? +vendor.basicRate : 0;
        const rate = rateIndustry ? rateIndustry.rates[service.id].value : basicRate;
        step.finance['Price'].payables = step.name !== "translate1" ? +(metrics.totalWords*rate).toFixed(2)
        : calcCost(metrics, 'vendor', rate);
        step.vendorRate = rate;
        return step;
    } catch(err) {
        console.log(err);
        console.log("Error in payablesCalc");
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
    return +cost.toFixed(2);
}

async function getCustomerRate({task, industry, customerId}) {
    try {
        const service = await Services.findOne({"_id": task.service});
        const customer = await getClient({"_id": customerId});
        const comb = getCombination({combs: customer.languageCombinations, service, task});
        const rateIndustry = comb ? comb.industries.find(item => {
            return item.industry.id === industry
        }) : "";
        const customerRate = rateIndustry ? rateIndustry.rates[task.service].value : "";
        return customerRate;
    } catch(err) {
        console.log(err);
        console.log("Error in getCustomerRate");
    }
}

function getCombination({combs, service, task}) {
    return combs.filter(item => {
        return service.languageForm === "Duo" ? item.source : !item.source
    }).find(item => {
        if(service.languageForm === "Duo") {
            return item.source.symbol === task.sourceLanguage &&
                    item.target.symbol === task.targetLanguage
            }
        return item.target.symbol === task.targetLanguage &&
        item.package === task.package
    })
}

async function calcProofingStep({task, project, words}) {
    try {
        const service = await getOneService({symbol: 'pr'});
        const rate = await getCustomerRate({task: {...task, "service": service.id}, industry: project.industry.id, customerId: project.customer.id});
        const cost = (words*rate).toFixed(2);
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
        for(let step of steps) {
            let taskIndex = tasks.findIndex(item => item.taskId === step.taskId);
            let activeVendors = vendors.filter(item => item.status === "Active");
            let matchedVendors = await getMatchedVendors({activeVendors, step, project})
            if(matchedVendors.length === 1) {
                step.vendor = {...matchedVendors[0], _id: matchedVendors[0].id};
                tasks[taskIndex].metrics = await updateTaskMetrics(tasks[taskIndex].metrics, matchedVendors[0].id);            
                step = await payablesCalc({task: tasks[taskIndex], project, step});
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
            const isMatching = await checkForLanguages({vendor, step, project});
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

async function checkForLanguages({vendor, step, project}) {
    try {
        const service = step.name === "translate1" ? await Services.findOne({"symbol": "tr"}) : await Services.findOne({"symbol": "pr"});
        return vendor.languageCombinations.find(item => {
            if(item.source && item.source.symbol === step.source && 
                item.target.symbol === step.target) {
                    return hasRateValue({
                            service: service.id, 
                            vendorIndustries: item.industries, 
                            stepIndustry: project.industry.id
                        });
            }
        })
    } catch(err) {
        console.log(err);
        console.log("Error in checkForLanguages");
    }
}

function hasRateValue({service, vendorIndustries, stepIndustry}) {
    const industry = vendorIndustries.find(item => item.industry.id === stepIndustry);
    return industry ? industry.rates[service].value : false;
}

async function updateProjectCosts(project) {
    let receivables = project.tasks.reduce((init, current) => {
        return +init + +current.finance['Price'].receivables
    }, 0).toFixed(2);
    const payables = project.tasks.reduce((init, current) => {
        return +init + +current.finance['Price'].payables
    }, 0).toFixed(2);
    let finance = {};
    finance['Wordcount'] = getWordsData(project);
    finance['Price'] = {'receivables': receivables, 'payables': payables};
    let projectToUpdate = {};
    let discount = {};
    if(project.finance['Discount']) {
        discount = {...project.finance['Discount']};
        discount.receivables = (receivables/100*discount.value).toFixed(2);
        finance['Price'].receivables -= discount.receivables;
        finance['Discount'] = discount;
    }
    projectToUpdate = {...project, finance};
    try {
        return await updateProject({"_id": project.id}, projectToUpdate);
    } catch(err) {
        console.log(err);
        console.log("Error in updateProjectCosts");
    }
}

function getWordsData(project) {
    let receivableWords = 0;
    let payableWords = 0;
    for(const task of project.tasks) {
        const taskPayableWords = wordsCalculation(task);
        receivableWords += task.metrics.totalWords - task.metrics.nonTranslatable;
        payableWords += task.metrics.totalWords - task.metrics.nonTranslatable - taskPayableWords;
    }
    return {'receivables': receivableWords, 'payables': payableWords}
}

function  wordsCalculation(task) {
    const excludeKeys = ["nonTranslatable", "totalWords"]
    const words = Object.keys(task.metrics).filter(item => {
        return excludeKeys.indexOf(item) === -1;
    }).reduce((init, cur) => {
        return init + task.metrics[cur].value;
    }, 0)
    return words;
}

module.exports = { metricsCalc, receivablesCalc, payablesCalc, setDefaultStepVendors, updateProjectCosts, calcCost, updateTaskMetrics, taskMetricsCalc };