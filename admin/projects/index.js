const { getProject, getProjects, updateProject } = require('./getProjects');
const { storeFiles, getDeliverablesLink, storeTargetFile } = require('./files');
const { changeProjectProp, getProjectAfterCancelTasks, updateProjectStatus, setStepsStatus, updateWithApprovedTasks, 
    updateTaskTargetFiles, getAfterApproveFile, updateProjectProgress, getAfterReopenSteps, updateNonWordsTaskTargetFiles } = require('./updates');
const { stepCancelNotifyVendor, getMessage, taskCompleteNotifyPM, notifyClientTaskReady, sendClientDeliveries, notifyDeliverablesDownloaded, sendTasksQuote } = require('./emails');
const  { createProject, createTasks } = require('./create');
const { getProjectWithUpdatedFinance } = require('./metrics');
const { getProjectAfterFinanceUpdated } = require('./porjectFinance');

module.exports = {
    getProject,
    getProjects,
    updateProject,
    storeFiles,
    storeTargetFile,
    changeProjectProp,
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