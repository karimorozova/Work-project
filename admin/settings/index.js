const { createNewIndustry, updateIndustry, deleteIndustryFiles } = require('./industries');
const { updateLanguage } = require('./languages');
const  { createNewService, updateService, deleteServiceIcon } = require('./services');

module.exports = {
    createNewIndustry,
    updateIndustry,
    deleteIndustryFiles,
    updateLanguage,
    createNewService, 
    updateService, 
    deleteServiceIcon
}