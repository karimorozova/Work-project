const { metricsCalc, receivablesCalc, payablesCalc, updateProjectCosts, updateTaskMetrics, calcCost, taskMetricsCalc } = require('./calculations');
const { getProject, getProjects, updateProject } = require('./getProjects');
const { storeFiles } = require('./files');
const { changeProjectProp } = require('./updates');

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
    taskMetricsCalc,
    calcCost,
    changeProjectProp
}

module.exports = projectFunctions;