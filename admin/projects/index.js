const { getProject, getProjects, updateProject, getFilteredProjects } = require('./getProjects');
const { storeFiles, getDeliverablesLink, storeTargetFile } = require('./files');
const { toggleProjectProp, getProjectAfterCancelTasks, updateProjectStatus, setStepsStatus, updateWithApprovedTasks, 
    updateTaskTargetFiles, getAfterApproveFile, updateProjectProgress, getAfterReopenSteps, updateNonWordsTaskTargetFiles } = require('./updates');
const { stepCancelNotifyVendor, getMessage, taskCompleteNotifyPM, notifyClientTaskReady, sendClientDeliveries, notifyDeliverablesDownloaded, sendTasksQuote } = require('./emails');
const  { createProject, createTasks } = require('./create');
const { getProjectWithUpdatedFinance } = require('./metrics');
const { getProjectAfterFinanceUpdated } = require('./porjectFinance');

module.exports = {
    getProject,
    getProjects,
    updateProject,
    getFilteredProjects,
    storeFiles,
    storeTargetFile,
    toggleProjectProp,
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
    updateNonWordsTaskTargetFiles
}