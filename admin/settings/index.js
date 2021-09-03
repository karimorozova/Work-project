const {
	createNewIndustry,
	updateIndustry,
	deleteIndustryFiles
} = require("./industries")

const {
	updateLanguage
} = require("./languages")

const {
	getClientsApi
} = require("./getClientsApi")

const {
	createNewService,
	updateService,
	deleteServiceIcon
} = require("./services")

const {
	getTierInfo,
	updateTierInfo,
	getIndustryTier,
	updateIndustryTier,
	createIndustryTier
} = require("./tierAndLqa")

const {
	getPaymentTerms,
	managePaymentTerms,
	deletePaymentTerms
} = require('./paymentTerms')

module.exports = {
	deletePaymentTerms,
	managePaymentTerms,
	getPaymentTerms,
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
	getClientsApi
}
