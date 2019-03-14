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
        assignedSteps.push({...step._doc, 
            projectId: project.projectId, 
            projectName: project.projectName,
            projectStatus: project.status,
            manager: project.projectManager,
            industry: project.industry,
            xtmJobIds: stepTask.xtmJobs,
            refFiles: stepTask.refFiles
        });
    }
    return assignedSteps;
}

async function updateStepProp({jobId, prop, value}) {
    try {
        const project = await getProject({'steps._id': jobId});
        let steps = project.steps.map(item => {
            if(item.id === jobId) {
                item[prop] = value;
                return item;
            }
            return item;
        })
        await Projects.updateOne({'steps._id': jobId}, { steps });
    } catch(err) {
        console.log(err);
        console.log("Error in updateStepProp");
    }
}

module.exports = { getJobs, updateStepProp };