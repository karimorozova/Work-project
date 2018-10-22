const { metricsCalc, receivablesCalc, payablesCalc, updateProjectCosts, updateTaskMetrics, taskMetricsCalc } = require('./calculations');
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
    storeFiles,
    updateTaskMetrics,
    taskMetricsCalc
}

module.exports = projectFunctions;