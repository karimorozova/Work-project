const { metricsCalc, receivablesCalc, payablesCalc, updateProjectCosts } = require('./calculations');
const { getProject, getProjects, getUpdatedProject } = require('./getProjects');
const { storeFiles } = require('./files');

const projectFunctions = {
    metricsCalc,
    receivablesCalc,
    payablesCalc,
    updateProjectCosts,
    getProject,
    getProjects,
    getUpdatedProject,
    storeFiles
}

module.exports = projectFunctions;