const { metricsCalc, receivablesCalc, payablesCalc, updateProjectCosts } = require('./calculations');
const { getProject, getProjects, getUpdatedProject } = require('./getProjects');

const projectFunctions = {
    metricsCalc,
    receivablesCalc,
    payablesCalc,
    updateProjectCosts,
    getProject,
    getProjects,
    getUpdatedProject
}

module.exports = projectFunctions;