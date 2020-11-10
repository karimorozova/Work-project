const { getProject, getProjects, updateProject, getFilteredProjects, getProjectAfterUpdate } = require('./getProjects');
const { storeFiles, getDeliverablesLink, manageDeliveryFile, getPdf } = require('./files');
const {
  getProjectAfterCancelTasks, updateProjectStatus, setStepsStatus, updateWithApprovedTasks, downloadCompletedFiles,
  updateProjectProgress, getAfterReopenSteps, updateNonWordsTaskTargetFiles, updateOtherProject,
  assignMemoqTranslator, checkProjectHasMemoqStep, assignProjectManagers, updateProjectStatusForClientPortalProject
} = require('./updates');
const {
  stepCancelNotifyVendor, getMessage, taskCompleteNotifyPM, notifyClientTaskReady, notifyManagerStepStarted, notifyStepDecisionMade,
  sendClientDeliveries, notifyDeliverablesDownloaded, notifyProjectDelivery, stepCompletedNotifyPM, notifyReadyForDr2, notifyStepReopened,
  notifyVendorStepStart
} = require('./emails');
const {
  createProject,
  createTasks,
  createTasksFromRequest,
  getTasksForCustomUnits,
  getStepsForDuoUnits
} = require('./create');
const { createTasksForWordcount } = require('./taskForWordcount');
const { getProjectWithUpdatedFinance } = require('./metrics');
const { getProjectAfterFinanceUpdated } = require('./porjectFinance');

module.exports = {
  getProject,
  getProjects,
  updateProject,
  updateOtherProject,
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
  createTasksForWordcount,
  downloadCompletedFiles,
  notifyProjectDelivery,
  notifyManagerStepStarted,
  stepCompletedNotifyPM,
  notifyStepDecisionMade,
  notifyReadyForDr2,
  notifyStepReopened,
  getPdf,
  notifyVendorStepStart,
  getProjectAfterUpdate,
  assignMemoqTranslator,
  checkProjectHasMemoqStep,
  assignProjectManagers,
  getTasksForCustomUnits,
  getStepsForDuoUnits,
  updateProjectStatusForClientPortalProject
}
