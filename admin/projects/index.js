const { metricsCalc, receivablesCalc, payablesCalc, updateProjectCosts, updateTaskMetrics, calcCost, taskMetricsCalc, setDefaultStepVendors } = require('./calculations');
const { getProject, getProjects, updateProject } = require('./getProjects');
const { storeFiles, deleteCopiedFiles } = require('./files');
const { changeProjectProp, cancelTasks, cancelSteps, updateProjectStatus } = require('./updates');
const { notifyVendors } = require('./emails');

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
    cancelSteps,
    updateProjectStatus,
    notifyVendors,
    setDefaultStepVendors
}

module.exports = projectFunctions;