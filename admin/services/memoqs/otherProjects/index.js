const { getFilteredOtherProjects } = require('./filteredOtherProjects');
const { createOtherProjectFinanceData } = require('./financeData');
const { filterMemoqProjectsVendors, checkProjectStructure, doesAllTasksFinished } = require('./helpers');
const {
  updateMemoqProjectFinance,
  updateAllMemoqProjects,
  updateMemoqProjectStatus,
  parseMessagesAndUpdateProjects
} = require('./otherProjectUpdates');

module.exports = {
  getFilteredOtherProjects,
  createOtherProjectFinanceData,
  filterMemoqProjectsVendors,
  checkProjectStructure,
  updateMemoqProjectFinance,
  updateAllMemoqProjects,
  updateMemoqProjectStatus,
  doesAllTasksFinished,
  parseMessagesAndUpdateProjects
};
