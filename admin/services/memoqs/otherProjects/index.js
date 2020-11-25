const { getFilteredOtherProjects } = require('./filteredOtherProjects');
const { createOtherProjectFinanceData } = require('./financeData');
const { filterMemoqProjectsVendors, checkProjectStructure } = require('./helpers');
const { updateMemoqProjectFinance, updateAllMemoqProjects, updateMemoqProjectStatus } = require('./otherProjectUpdates');

module.exports = {
  getFilteredOtherProjects,
  createOtherProjectFinanceData,
  filterMemoqProjectsVendors,
  checkProjectStructure,
  updateMemoqProjectFinance,
  updateAllMemoqProjects,
  updateMemoqProjectStatus
};
