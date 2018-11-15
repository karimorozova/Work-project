const { metricsCalc, receivablesCalc, payablesCalc, updateProjectCosts, updateTaskMetrics, calcCost, taskMetricsCalc } = require('./calculations');
const { getProject, getProjects, updateProject } = require('./getProjects');
const { storeFiles, deleteCopiedFiles } = require('./files');
const { changeProjectProp, cancelTasks, cancelSteps } = require('./updates');

const projectFunctions = {
    metricsCalc,
    receivablesCalc,
    payablesCalc,
    updateProjectCosts,
    getProject,
    getProjects,
    updateProject,
    storeFiles,
    deleteCopiedFiles,
    updateTaskMetrics,
    taskMetricsCalc,
    calcCost,
    changeProjectProp,
    cancelTasks,
    cancelSteps
}

module.exports = projectFunctions;