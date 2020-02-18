const { getProject, updateProject } = require('./getProjects');
const { receivablesCalc, taskMetricsCalc } = require('../сalculations/wordcount');
// const { getMetrics, getAnalysis } = require('../services');
const { getProjectAnalysis } = require('../services/memoqs/projects');

async function checkProjectForMetrics({projectId}) {
    // try {
    //     const project = await getProject({"_id": projectId});
    //     const { tasks } = project;
    //     for(let task of tasks) {
    //         if(task.service.calculationUnit === 'Words') {
    //             const { status } = await getAnalysis(task.projectId);
    //             if(status !== 'FINISHED') {
    //                 return false;
    //             }
    //         }
    //     }
    //     return true;
    // } catch(err) {
    //     console.log(err);
    //     console.log("Error in checkProjectForMetrics");
    // }
}

async function updateProjectMetrics({projectId}) {
    try {
        const project = await getProject({"_id": projectId});
        let { steps, tasks } = project;
        for(let task of tasks) {
            if(task.service.calculationUnit === 'Words') {
                const analysis = await getProjectAnalysis(task.memoqProjectId);
                const taskMetrics = getTaskMetrics({task, matrix: project.customer.matrix, analysis});
                task.metrics = !task.finance.Price.receivables ? {...taskMetrics} : task.metrics;
                task.finance.Wordcount = calculateWords(task.metrics);
                steps = getTaskSteps(steps, task);
            }
        }
        return await updateProject({"_id": projectId}, {tasks, steps, isMetricsExist: true});
    } catch(err) {
        console.log(err);
        console.log("Error in updateProjectMetrics");
    }
}

function getTaskMetrics({task, matrix, analysis}) {
    let targetMetrics = analysis.AnalysisResultForLang;
    if(Array.isArray(analysis.AnalysisResultForLang)){
        targetMetrics = analysis.AnalysisResultForLang.find(item => item.TargetLangCode === task.memoqTarget);
    }
    const metrics = Object.keys(targetMetrics.Summary).reduce((acc,cur) => {
        return cur !== 'Fragments' ? {...acc, [cur]: +targetMetrics.Summary[cur].SourceWordCount} : acc;
    }, {})
    const memoqFilledMetrics = getFilledMemoqMetrics(metrics);
    let taskMetrics = taskMetricsCalc({metrics: memoqFilledMetrics, matrix, prop: "client"});
    return {...taskMetrics, totalWords: memoqFilledMetrics.All}
}

function getFilledMemoqMetrics(metrics) {
    return {
        xTranslated: {text: "X translated", value: +metrics.XTranslated},
        repeat: {text: "Repetitions", value: +metrics.Repetition},
        repeat100: {text: "100%", value: +metrics.Hit100},
        repeat50: {text: "50-74%", value: +metrics.Hit50_74},
        repeat75: {text: "75-84%", value: +metrics.Hit75_84},
        repeat85: {text: "85-94%", value: +metrics.Hit85_94},
        repeat95: {text: "95-99%", value: +metrics.Hit95_99},
        noMatch: {text: "No match", value: +metrics.NoMatch + +metrics.Hit101}
    }
}

async function getProjectWithUpdatedFinance(project) {
    let projectToUpdate = {...project._doc, id: project.id};
    let { tasks, steps } = projectToUpdate;
    try {
        for(let step of steps) {
            if(!step.finance.Price.receivables && step.serviceStep.calculationUnit === 'Words') {
                let taskIndex = tasks.findIndex(item => item.taskId === step.taskId);
                const receivables = step.finance.Price.receivables ? {rate: step.clientRate, cost: +step.finance.Price.receivables}
                : await receivablesCalc({task: tasks[taskIndex], project: projectToUpdate, step});
                step.clientRate = receivables.rate;
                step.finance.Price.receivables = receivables.cost;
                tasks[taskIndex].finance.Price.receivables = +(tasks[taskIndex].finance.Price.receivables+step.finance.Price.receivables).toFixed(2);
            }
        }
        return {...projectToUpdate, tasks, steps};
    } catch(err) {
        console.log(err);
        console.log("Error in getProjectWithUpdatedFinance");        
    }
}

function getTaskSteps(steps, task) {
    const serviceSteps = task.service.steps.reduce((acc, cur) => {
        return {...acc, [cur.stage]: cur.step}
    },{})
    let updatedSteps = JSON.parse(JSON.stringify(steps));
    let counter = 1;
    for(let i = 0; i < task.stepsDates.length; i++) {
        const existedTask = updatedSteps.find(item => item.taskId === task.taskId && item.name === serviceSteps[`stage${i+1}`].title);
        if(!existedTask) {
            let stepsIdCounter = counter < 10 ? `S0${counter}` : `S${counter}`;
            const serviceStep = serviceSteps[`stage${i+1}`];
            updatedSteps.push({
                stepId: `${task.taskId} ${stepsIdCounter}`,
                taskId: task.taskId,
                serviceStep,
                name: serviceStep.title,
                sourceLanguage: task.sourceLanguage,
                targetLanguage: task.targetLanguage,
                memoqSource: task.memoqSource,
                memoqTarget: task.memoqTarget,
                vendor: null,
                start: task.stepsDates[i].start,
                deadline: task.stepsDates.length > 1 ? task.stepsDates[i].deadline : task.deadline,
                progress: setStepsProgress(serviceStep.symbol, task.memoqDocs),
                status: "Created",
                clientRate: "",
                finance: {
                    'Wordcount': { ...task.finance.Wordcount },
                    'Price': {receivables: 0, payables: 0}
                },
                vendorRate: "",
                check: false,
                vendorsClickedOffer: [],
                isVendorRead: false
            })
            counter++;
        } else {
            for(let step of updatedSteps) {
                if(step.taskId === task.taskId) {
                    step.progress = setStepsProgress(serviceSteps[`stage${i+1}`].symbol, task.memoqDocs);
                }
            }
        }
    }
    return updatedSteps;
}

function calculateWords(metrics) {
    const receivables = Object.keys(metrics).filter(item => item !== "totalWords")
        .reduce((prev, cur) => {
            return prev + metrics[cur].value*metrics[cur].client;
        }, 0);
    return { receivables: Math.round(receivables), payables: "" };
}

function setStepsProgress(symbol, docs) {
    const prop = symbol === 'translation' ? 'ConfirmedWordCount' : 'Reviewer1ConfirmedWordCount';
    const progressData = docs.reduce((acc, cur) => {
        acc.wordsDone = acc.wordsDone ? acc.wordsDone + +cur[prop] : +cur[prop];
        acc.totalWordCount = acc.totalWordCount ? acc.totalWordCount + +cur.TotalWordCount : +cur.TotalWordCount;
        return acc;
    }, {});
    let stepProgress = progressData;
    for(let doc of docs) {
        stepProgress[doc.DocumentGuid] = { wordsDone: +doc[prop], totalWordCount: +doc.TotalWordCount, fileName: doc.DocumentName };
    }
    return stepProgress;
}

module.exports = { updateProjectMetrics, getProjectWithUpdatedFinance, checkProjectForMetrics }