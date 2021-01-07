const { getFilteredOtherProjects } = require('./filteredOtherProjects');
const { createOtherProjectFinanceData } = require('./financeData');
const { filterMemoqProjectsVendors, checkProjectStructure, doesAllTasksFinished, defineProjectStatus } = require('./helpers');
const {
	updateMemoqProjectFinance,
	updateAllMemoqProjects,
	updateMemoqProjectStatus,
	updateStatusesForOtherProjects,
} = require('./otherProjectUpdates');
const { getMemoqProjectsForClientPortal } = require('./getMemoqProject');

module.exports = {
	getFilteredOtherProjects,
	createOtherProjectFinanceData,
	filterMemoqProjectsVendors,
	checkProjectStructure,
	updateMemoqProjectFinance,
	updateAllMemoqProjects,
	updateMemoqProjectStatus,
	// doesAllTasksFinished,
	updateStatusesForOtherProjects,
	getMemoqProjectsForClientPortal,
  defineProjectStatus
};
