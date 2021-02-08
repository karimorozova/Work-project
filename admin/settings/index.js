const { createNewIndustry, updateIndustry, deleteIndustryFiles } = require('./industries');
const { updateLanguage } = require('./languages');
const { createNewService, updateService, deleteServiceIcon } = require('./services');
const { getTierInfo, updateTierInfo, getIndustryTier, updateIndustryTier, createIndustryTier } = require('./tierAndLqa')

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
    getIndustryTier,
    updateIndustryTier,
    createIndustryTier,
}