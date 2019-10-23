const { getProject, updateProject } = require('./getProjects');
const { receivablesCalc } = require('../сalculations/wordcount');
const { getMetrics } = require('../services');

async function updateProjectMetrics({projectId}) {
    try {
        const project = await getProject({"_id": projectId});
        let { steps, tasks } = project;
        for(let task of tasks) {
            if(task.service.calculationUnit === 'Words') {
                const { taskMetrics, progress } = await getMetrics({projectId: task.projectId, customerId: project.customer.id});
                if(progress.invalid) {
                    return false;
                }
                task.metrics = !task.finance.Price.receivables ? {...taskMetrics} : task.metrics;
                task.finance.Wordcount = calculateWords(task.metrics);
                steps = getTaskSteps({steps, progress, task});
            }
        }
        return await updateProject({"_id": projectId}, {tasks, steps, isMetricsExist: true});
    } catch(err) {
        console.log(err);
        console.log("Error in updateProjectMetrics");
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

function getTaskSteps({steps, progress, task}) {
    let updatedSteps = JSON.parse(JSON.stringify(steps));
    let counter = 1;
    for(const key in progress) {
        const existedTask = updatedSteps.find(item => {
            return item.taskId === task.taskId && item.catName === key
        })
        if(!existedTask) {
            const {startDate, deadline} = getStepsDates({task, key});
            let stepsIdCounter = counter < 10 ? `S0${counter}` : `S${counter}`;
            const serviceStep = getCorrectServiceStep(key, task.service.steps);
            if(key !== "jobsMetrics") {
                updatedSteps.push({
                    stepId: `${task.taskId} ${stepsIdCounter}`,
                    taskId: task.taskId,
                    serviceStep,
                    name: serviceStep.title,
                    catName: key,
                    sourceLanguage: task.sourceLanguage,
                    targetLanguage: task.targetLanguage,
                    vendor: null,
                    start: startDate,
                    deadline: deadline,
                    progress: setStepsProgress(key, progress),
                    status: "Created",
                    receivables: "",
                    payables: "",
                    clientRate: "",
                    finance: {
                        'Wordcount': { ...task.finance.Wordcount },
                        'Price': {receivables: 0, payables: 0}
                    },
                    vendorRate: "",
                    margin: 0,
                    check: false,
                    vendorsClickedOffer: [],
                    isVendorRead: false
                })
                counter++;
            }
        } else {
            for(let step of updatedSteps) {
                if(step.taskId === task.taskId) {
                    step.progress = progress[step.catName];
                }
            }
        }
    }
    return updatedSteps;
}

function getCorrectServiceStep(key, serviceSteps) {
    const stage1 = serviceSteps.find(item => item.stage === "stage1");
    const stage2 = serviceSteps.find(item => item.stage === "stage2");
    return key === "translate1" ? stage1.step : stage2.step; 
}

function calculateWords(metrics) {
    const excludeKeys = ["nonTranslatable", "totalWords"];
    const repetitions = Object.keys(metrics).filter(item => {
        return excludeKeys.indexOf(item) === -1;
    }).reduce((prev, cur) => {
        return prev + metrics[cur].value;
    }, 0);
    const receivables = metrics.totalWords - metrics.nonTranslatable;
    const payables = receivables - repetitions;
    return { receivables, payables };
}

function setStepsProgress(name, progress) {
    if(!progress.jobsMetrics.length) {
        return { wordsDone: 0, wordsToBeDone: 0, totalWordCount: 1 }
    }
    const { jobsMetrics } = progress;
    let stepProgress = progress[name];
    for(let metrics of jobsMetrics) {
        const { jobId, metricsProgress } = metrics;
        const { wordsDone, wordsToBeDone, totalWordCount } = metricsProgress[name];
        stepProgress[jobId] = { wordsDone, wordsToBeDone, totalWordCount };
    }
    return stepProgress;
}

function getStepsDates({task, key}) {
    let startDate = task.start; 
    let deadline = task.deadline; 
    if(task.stepsDates.length && task.stepsDates.length > 1) {
        startDate = key === 'translate1' ? task.stepsDates[0].start : task.stepsDates[1].start;
        deadline = key === 'translate1' ? task.stepsDates[0].deadline : task.stepsDates[1].deadline;        
    }
    return {startDate, deadline};
}

module.exports = { updateProjectMetrics, getProjectWithUpdatedFinance }