const { getProject, getProjects, updateProject, getFilteredProjects } = require('./getProjects');
const { storeFiles, getDeliverablesLink, storeTargetFile, manageDeliveryFile } = require('./files');
const { getProjectAfterCancelTasks, updateProjectStatus, setStepsStatus, updateWithApprovedTasks, 
    updateTaskTargetFiles, getAfterApproveFile, updateProjectProgress, getAfterReopenSteps, updateNonWordsTaskTargetFiles } = require('./updates');
const { stepCancelNotifyVendor, getMessage, taskCompleteNotifyPM, notifyClientTaskReady, sendClientDeliveries, notifyDeliverablesDownloaded, sendTasksQuote } = require('./emails');
const  { createProject, createTasks, createMemoqTasks, createTasksFromRequest } = require('./create');
const { getProjectWithUpdatedFinance, checkProjectForMetrics } = require('./metrics');
const { getProjectAfterFinanceUpdated } = require('./porjectFinance');

module.exports = {
    getProject,
    getProjects,
    updateProject,
    getFilteredProjects,
    storeFiles,
    storeTargetFile,
    manageDeliveryFile,
    getProjectAfterCancelTasks,
    updateProjectStatus,
    stepCancelNotifyVendor,
    setStepsStatus,
    createProject,
    createTasks,
    getMessage,
    updateTaskTargetFiles,
    taskCompleteNotifyPM,
    getAfterApproveFile,
    notifyClientTaskReady,
    getDeliverablesLink,
    sendClientDeliveries,
    notifyDeliverablesDownloaded,
    getProjectWithUpdatedFinance,
    updateProjectProgress,
    updateWithApprovedTasks,
    sendTasksQuote,
    getAfterReopenSteps,
    getProjectAfterFinanceUpdated,
    updateNonWordsTaskTargetFiles,
    createTasksFromRequest,
    checkProjectForMetrics,
    createMemoqTasks
}