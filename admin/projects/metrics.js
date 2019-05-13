const { getProject, updateProject } = require('./getProjects');
const { receivablesCalc } = require('./calculations');
const { getMetrics } = require('../services');

async function updateProjectMetrics({projectId}) {
    try {
        const project = await getProject({"_id": projectId});
        let { steps, tasks } = project;
        for(let task of tasks) {
            const { taskMetrics, progress } = await getMetrics({projectId: task.projectId, customerId: project.customer.id});
            task.metrics = !task.finance.Price.receivables ? {...taskMetrics} : task.metrics;
            task.finance.Wordcount = calculateWords(task.metrics);
            steps = getTaskSteps({steps, progress, task});
        }
        await updateProject({"_id": projectId}, {tasks, steps, isMetricsExist: true});
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
            let taskIndex = tasks.findIndex(item => item.taskId === step.taskId);           
            const receivables = step.finance.Price.receivables ? {rate: step.clientRate, cost: step.finance.Price.receivables}
            : await receivablesCalc({task: tasks[taskIndex], project: projectToUpdate, step});
            step.clientRate = receivables.rate;
            step.finance.Price.receivables = receivables.cost;
            tasks[taskIndex].finance.Price.receivables += +step.finance.Price.receivables;
        }
        return {...projectToUpdate, tasks, steps};
    } catch(err) {
        console.log(err);
        console.log("Error in getProjectWithUpdatedFinance");        
    }
}

function getTaskSteps({steps, progress, task}) {
    let updatedSteps = [...steps];
    for(const key in progress) {
        const existedTask = updatedSteps.find(item => {
            return item.taskId === task.taskId && item.name === key
        })
        if(!existedTask) {
            const {startDate, deadline} = getStepsDates({task, key});
            if(key !== "jobsMetrics") {
                updatedSteps.push({
                    taskId: task.taskId,
                    name: key,
                    source: task.sourceLanguage,
                    target: task.targetLanguage,
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
                        'Price': {receivables: "", payables: ""}
                    },
                    vendorRate: "",
                    margin: "",
                    check: false,
                    vendorsClickedOffer: [],
                    isVendorRead: false
                })
            }
        } else {
            for(let step of updatedSteps) {
                if(step.taskId === task.taskId) {
                    step.progress = progress[step.name];
                }
            }
        }
    }
    return updatedSteps;
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
    if(task.stepsDates.length) {
        startDate = key === 'translate1' ? task.stepsDates[0].start : task.stepsDates[1].start;
        deadline = key === 'translate1' ? task.stepsDates[0].deadline : task.stepsDates[1].deadline;
    }
    return {startDate, deadline};
}

module.exports = { updateProjectMetrics, getProjectWithUpdatedFinance }