const { createNewIndustry, updateIndustry, deleteIndustryFiles } = require('./industries');
const { updateLanguage } = require('./languages');
const { createNewService, updateService, deleteServiceIcon } = require('./services');
const { getTierInfo, updateTierInfo } = require('./tierAndLqa')

module.exports = {
    createNewIndustry,
    updateIndustry,
    deleteIndustryFiles,
    updateLanguage,
    createNewService, 
    updateService, 
    deleteServiceIcon,
    getTierInfo,
    updateTierInfo,
}