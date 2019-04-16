const { metricsCalc, receivablesCalc, payablesCalc, updateProjectCosts, updateTaskMetrics, calcCost, taskMetricsCalc, setDefaultStepVendors } = require('./calculations');
const { getProject, getProjects, updateProject } = require('./getProjects');
const { storeFiles, deleteCopiedFiles } = require('./files');
const { changeProjectProp, cancelTasks, cancelSteps, updateProjectStatus, setStepsStatus } = require('./updates');
const { notifyVendors, getMessage } = require('./emails');
const  { createProject, createTasks } = require('./create');

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
    setDefaultStepVendors,
    setStepsStatus,
    createProject,
    createTasks,
    getMessage
}

module.exports = projectFunctions;