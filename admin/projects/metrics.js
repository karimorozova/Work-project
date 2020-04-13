const { getProject, updateProject } = require('./getProjects');
const { receivablesCalc, setTaskMetrics } = require('../сalculations/wordcount');
const { getProjectAnalysis } = require('../services/memoqs/projects');

async function updateProjectMetrics({projectId}) {
    try {
        const project = await getProject({"_id": projectId});
        let { steps, tasks } = project;
        let isMetricsExist = true;
        for(let task of tasks) {
            if(task.service.calculationUnit === 'Words') {
                const analysis = await getProjectAnalysis(task.memoqProjectId);
                if(analysis && analysis.AnalysisResultForLang) {
                    const taskMetrics = getTaskMetrics({task, matrix: project.customer.matrix, analysis});
                    task.metrics = !task.finance.Price.receivables ? {...taskMetrics} : task.metrics;
                    task.finance.Wordcount = calculateWords(task);
                    steps = getTaskSteps(steps, task);
                } else {
                    isMetricsExist = false;
                }
            }
        }
        return await updateProject({"_id": projectId}, {tasks, steps, isMetricsExist});
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
    let taskMetrics = setTaskMetrics({metrics: memoqFilledMetrics, matrix, prop: "client"});
    return {...taskMetrics, totalWords: metrics.All}
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
        const existedStep = updatedSteps.find(item => item.taskId === task.taskId && item.name === serviceSteps[`stage${i+1}`].title);
        if(!existedStep) {
            let stepsIdCounter = counter < 10 ? `S0${counter}` : `S${counter}`;
            const serviceStep = {...serviceSteps[`stage${i+1}`], memoqAssignmentRole: i};
            updatedSteps.push({
                stepId: `${task.taskId} ${stepsIdCounter}`,
                taskId: task.taskId,
                serviceStep,
                name: serviceStep.title,
                sourceLanguage: task.sourceLanguage,
                targetLanguage: task.targetLanguage,
                memoqProjectId: task.memoqProjectId,
                memoqSource: task.memoqSource,
                memoqTarget: task.memoqTarget,
                memoqDocIds: task.memoqDocs.map(item => item.DocumentGuid),
                vendor: null,
                start: task.stepsDates[i].start || task.start,
                deadline: getStepDeadline(task, i),
                progress: setStepsProgress(serviceStep.symbol, task.memoqDocs),
                status: "Created",
                clientRate: "",
                finance: {
                    'Wordcount': getStepWordcount(task.metrics, `stage${i+1}`),
                    'Price': {receivables: 0, payables: 0}
                },
                vendorRate: "",
                totalWords: task.metrics.totalWords,
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

function getStepDeadline(task, i) {
    if(task.stepsDates.length > 1) {
        return task.stepsDates[i].deadline || task.deadline
    }
    return task.deadline;
}

function getStepWordcount(taskMetrics, stage) {
    const receivables = stage === 'stage1' ? calculateTranslationWords(taskMetrics) : taskMetrics.totalWords;
    const payables = stage === 'stage1' ? 0 : taskMetrics.totalWords;
    return { receivables, payables };
}

function calculateWords(task) {
    const { metrics, stepsDates } = task;
    let receivables = calculateTranslationWords(metrics);
    receivables = stepsDates.length > 1 ? receivables + metrics.totalWords : receivables;
    const payables = stepsDates.length > 1 ? metrics.totalWords : 0;
    return { receivables, payables };
}

function calculateTranslationWords(metrics) {
    return Math.round(Object.keys(metrics).filter(item => item !== "totalWords")
    .reduce((prev, cur) => {
        return prev + metrics[cur].value*metrics[cur].client;
    }, 0));
}

function setStepsProgress(symbol, docs) {
    const prop = symbol === 'translation' ? 'ConfirmedWordCount' : 'Reviewer1ConfirmedWordCount';
    const totalProgress = docs.reduce((acc, cur) => {
        acc.wordsDone = acc.wordsDone ? acc.wordsDone + +cur[prop] : +cur[prop];
        acc.totalWordCount = acc.totalWordCount ? acc.totalWordCount + +cur.TotalWordCount : +cur.TotalWordCount;
        return acc;
    }, {});
    let stepProgress = {};
    for(let doc of docs) {
        stepProgress[doc.DocumentGuid] = { wordsDone: +doc[prop], totalWordCount: +doc.TotalWordCount, fileName: doc.DocumentName };
    }
    return {...stepProgress, ...totalProgress};
}

module.exports = { updateProjectMetrics, getProjectWithUpdatedFinance }