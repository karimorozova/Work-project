const { getProject, getProjects, updateProject, getFilteredProjects } = require('./getProjects');
const { storeFiles, getDeliverablesLink, manageDeliveryFile, getPdf } = require('./files');
const { getProjectAfterCancelTasks, updateProjectStatus, setStepsStatus, updateWithApprovedTasks, downloadCompletedFiles,
    updateProjectProgress, getAfterReopenSteps, updateNonWordsTaskTargetFiles } = require('./updates');
const { stepCancelNotifyVendor, getMessage, taskCompleteNotifyPM, notifyClientTaskReady, notifyManagerStepStarted, notifyStepDecisionMade,
    sendClientDeliveries, notifyDeliverablesDownloaded, notifyProjectDelivery, stepCompletedNotifyPM, notifyReadyForDr2, notifyStepReopened,
    notifyVendorStepStart } = require('./emails');
const  { createProject, createTasks, createTasksWithWordsUnit, createTasksFromRequest } = require('./create');
const { getProjectWithUpdatedFinance } = require('./metrics');
const { getProjectAfterFinanceUpdated } = require('./porjectFinance');

module.exports = {
    getProject,
    getProjects,
    updateProject,
    getFilteredProjects,
    storeFiles,
    manageDeliveryFile,
    getProjectAfterCancelTasks,
    updateProjectStatus,
    stepCancelNotifyVendor,
    setStepsStatus,
    createProject,
    createTasks,
    getMessage,
    taskCompleteNotifyPM,
    notifyClientTaskReady,
    getDeliverablesLink,
    sendClientDeliveries,
    notifyDeliverablesDownloaded,
    getProjectWithUpdatedFinance,
    updateProjectProgress,
    updateWithApprovedTasks,
    getAfterReopenSteps,
    getProjectAfterFinanceUpdated,
    updateNonWordsTaskTargetFiles,
    createTasksFromRequest,
    createTasksWithWordsUnit,
    downloadCompletedFiles,
    notifyProjectDelivery,
    notifyManagerStepStarted,
    stepCompletedNotifyPM,
    notifyStepDecisionMade,
    notifyReadyForDr2,
    notifyStepReopened,
    getPdf,
    notifyVendorStepStart
}