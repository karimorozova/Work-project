const { getProject, getProjects, updateProject } = require('./getProjects');
const { storeFiles, getDeliverablesLink } = require('./files');
const { changeProjectProp, getProjectAfterCancelTasks, updateProjectStatus, setStepsStatus, updateWithApprovedTasks, 
    updateStepsProgress, areAllStepsCompleted, updateTaskTargetFiles, getAfterApproveFile, updateProjectProgress } = require('./updates');
const { stepCancelNotifyVendor, getMessage, taskCompleteNotifyPM, notifyClientTaskReady, sendClientDeliveries, notifyDeliverablesDownloaded } = require('./emails');
const  { createProject, createTasks } = require('./create');
const { getProjectWithUpdatedFinance } = require('./metrics');

module.exports = {
    getProject,
    getProjects,
    updateProject,
    storeFiles,
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
    updateWithApprovedTasks
}