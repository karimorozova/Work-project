const { getProject, getProjects, updateProject } = require('./getProjects');
const { storeFiles, getDeliverablesLink, storeTargetFile } = require('./files');
const { changeProjectProp, getProjectAfterCancelTasks, updateProjectStatus, setStepsStatus, updateWithApprovedTasks, 
    updateStepsProgress, areAllStepsCompleted, updateTaskTargetFiles, getAfterApproveFile, updateProjectProgress, getAfterReopenSteps } = require('./updates');
const { stepCancelNotifyVendor, getMessage, taskCompleteNotifyPM, notifyClientTaskReady, sendClientDeliveries, notifyDeliverablesDownloaded, sendTasksQuote } = require('./emails');
const  { createProject, createTasks } = require('./create');
const { getProjectWithUpdatedFinance } = require('./metrics');

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
    updateStepsProgress,
    areAllStepsCompleted,
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
    getAfterReopenSteps
}