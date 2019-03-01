const { getProjects } = require('../../projects');

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
    const { steps } = project;
    let assignedSteps = [];
    let filteredSteps = steps.filter(item => item.vendor && item.vendor.id === id);
    for(let step of filteredSteps) {
        assignedSteps.push({...step._doc, projectId: project.projectId, projectName: project.projectName});
    }
    return assignedSteps;
}

module.exports = { getJobs };