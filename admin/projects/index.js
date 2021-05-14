const { getProject, getProjects, updateProject, getFilteredProjects, getProjectAfterUpdate } = require('./getProjects');

const {
  storeFiles,
  // getDeliverablesLink,
  createArchiveForDeliverableItem,
  manageDeliveryFile,
  getPdf,
  generateAndSaveCertificate
} = require('./files');

const {
  getProjectAfterCancelTasks, updateProjectStatus, setStepsStatus, updateWithApprovedTasks, downloadCompletedFiles,
  updateProjectProgress, getAfterReopenSteps, updateNonWordsTaskTargetFiles, updateOtherProject,
  assignMemoqTranslator, checkProjectHasMemoqStep, assignProjectManagers, updateProjectStatusForClientPortalProject,
  regainWorkFlowStatusByStepId
} = require('./updates');
const {
  stepCancelNotifyVendor, getMessage, taskCompleteNotifyPM,
  notifyManagerStepStarted, notifyStepDecisionMade,
  notifyDeliverablesDownloaded,
  // notifyProjectDelivery,
  stepCompletedNotifyPM, notifyReadyForDr2, notifyStepReopened,
  notifyVendorStepStart, sendQuotes, sendQuoteMessage, sendCostQuoteMessage,
  sendClientManyDeliveries
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
const { getProjectAfterFinanceUpdated, updateProjectFinanceOnDiscountsUpdate } = require('./porjectFinance');

const {
  addDR2,
  addMultiLangDR2,
  removeDR2,
  removeMultiDR2,
  taskApproveReady,
  taskApproveNotify,
  taskApproveDeliver,
  taskApproveDeliverMany,
  changeManagerDR2,
  changeManager,
} = require('./delivery');

const { getPriceAfterApplyingDiscounts } = require('./helpers');

module.exports = {
  changeManagerDR2,
  changeManager,
  taskApproveDeliverMany,
  createArchiveForDeliverableItem,
  taskApproveDeliver,
  taskApproveNotify,
  taskApproveReady,
  removeDR2,
  generateAndSaveCertificate,
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
  // getDeliverablesLink,
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
  // notifyProjectDelivery,
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
  updateProjectStatusForClientPortalProject,
  sendQuotes,
  sendQuoteMessage,
  sendCostQuoteMessage,
  updateProjectFinanceOnDiscountsUpdate,
  getPriceAfterApplyingDiscounts,
  regainWorkFlowStatusByStepId,
  addDR2,
  addMultiLangDR2,
  removeMultiDR2,
}
