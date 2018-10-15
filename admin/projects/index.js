const { metricsCalc, receivablesCalc, payablesCalc, updateProjectCosts } = require('./calculations');
const { getProject, getProjects } = require('./getProjects');

const projectFunctions = {
    metricsCalc,
    receivablesCalc,
    payablesCalc,
    updateProjectCosts,
    getProject,
    getProjects
}

module.exports = projectFunctions;