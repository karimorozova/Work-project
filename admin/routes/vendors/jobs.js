const { getProjects, getProject } = require('../../projects');
const { Projects } = require('../../models');

async function getJobs(id) {
    try {
        let jobs = [];
        const projects = await getProjects({'steps.vendor': id});
        for(let project of projects) {
            const steps = getSteps(project, id);
            jobs.push(...steps);
        }
        return jobs
    } catch(err) {
        console.log(err);
        console.log("Error in getJobs");
    }
}

function getSteps(project, id) {
    const { steps, tasks } = project;
    let assignedSteps = [];
    let filteredSteps = steps.filter(item => item.vendor && item.vendor.id === id);
    for(let step of filteredSteps) {
        const stepTask = tasks.find(item => item.taskId === step.taskId);
        const prevStep = step.name !== 'translate1' ? steps.find(item => item.name === "translate1" && item.taskId === step.taskId) : "";
        const prevStepProgress = prevStep ? prevStep.progress : "";
        assignedSteps.push({...step._doc,
            project_Id: project._id,
            projectId: project.projectId, 
            projectName: project.projectName,
            projectStatus: project.status,
            manager: project.projectManager,
            industry: project.industry,
            xtmJobIds: stepTask.xtmJobs,
            sourceFiles: stepTask.sourceFiles,
            refFiles: stepTask.refFiles,
            prevStepProgress,
            prevStepStatus: prevStep.status
        });
    }
    return assignedSteps;
}

async function updateStepProp({jobId, prop, value}) {
    try {
        const project = await getProject({'steps._id': jobId});
        const steps = project.steps.map(item => {
            if(item.id === jobId) {
                item[prop] = value;
                return item;
            }
            return item;
        })
        if(prop === "status") {
            return await manageStatuses({project, steps, jobId, status: value});
        }
        await Projects.updateOne({'steps._id': jobId}, { steps });
    } catch(err) {
        console.log(err);
        console.log("Error in updateStepProp");
    }
}

async function manageStatuses({project, steps, jobId, status}) {
    const step = steps.find(item => item.id === jobId);
    const task = project.tasks.find(item => item.taskId === step.taskId);
    try {
        if(status === "Completed" && isAllStepsCompleted({jobId, steps})) {
            return await setTaskStatusAndSave({project, jobId, steps, status: "Ready for Delivery"});
        }
        if(status === "Started" && task.status !== "Started") {
            return await setTaskStatusAndSave({project, jobId, steps, status: "Started"});
        }
        if(status === "Accepted" || status === "Rejected") {
            const updatedSteps = status === "Accepted" ? setAcceptedStepStatus({project, steps, jobId})
            : setRejectedStatus({steps, jobId});
            return await Projects.updateOne({"steps._id": jobId},{steps: updatedSteps});
        }
    } catch(err) {
        console.log(err);
        console.log("Error in manageStatuses");
    }
}

function setAcceptedStepStatus({project, steps, jobId}) {
    let status = "Accepted";
    if(project.status === "Started" || project.status === "Approved") {
        status = "Ready to Start";
    }
    const updatedSteps = steps.map(item => {
        if(item.id === jobId) {
            if(item.name === "translate1") {
                item.status = status; 
            } else {
                item.status = status === "Accepted" ? status : "Waiting to Start";
            }
        }
        return item;
    })
    return updatedSteps;
}

function setRejectedStatus({steps, jobId}) {
    return steps.map(item => {
        if(item.id === jobId) {
            item.status = "Rejected";
        }
        return item;
    })
}

async function setTaskStatusAndSave({project, jobId, steps, status}) {
    const { tasks } = project;
    const step = steps.find(item => item.id === jobId);
    const updatedTasks = tasks.map(item => {
        if(item.taskId === step.taskId) {
            item.status = status;
        }
        return item;
    })
    const projectStatus = project.status === "Started" ? project.status : "Started";
    try {
        await Projects.updateOne({'steps._id': jobId}, { status: projectStatus, tasks: updatedTasks, steps });
    } catch(err) {
        console.log(err);
        console.log("Error in setTaskStatusAndSave");
    }
}

function isAllStepsCompleted({jobId, steps}) {
    const currentStep = steps.find(item => item.id === jobId);
    const taskSteps = steps.filter(item => item.taskId === currentStep.taskid);
    const nonCompleted = taskSteps.reduce((init, cur) => {
        if(cur.taskId === currentStep.taskId && cur.status === "Completed") {
            return init;
        }
        return ++init;
    }, 0);
    return nonCompleted === 0;
}

module.exports = { getJobs, updateStepProp };