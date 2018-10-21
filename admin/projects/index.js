const { metricsCalc, receivablesCalc, payablesCalc, updateProjectCosts } = require('./calculations');
const { getProject, getProjects, updateProject } = require('./getProjects');
const { storeFiles } = require('./files');

const projectFunctions = {
    metricsCalc,
    receivablesCalc,
    payablesCalc,
    updateProjectCosts,
    getProject,
    getProjects,
    updateProject,
    storeFiles
}

module.exports = projectFunctions;