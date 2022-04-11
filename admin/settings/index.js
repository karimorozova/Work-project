const {
	createNewIndustry,
	updateIndustry,
	deleteIndustryFiles
} = require("./industries")

const {
	updateLanguage
} = require("./languages")

const {
	createCompany,
	getCompanies,
	getCompany,
	deleteCompany,
	editCompanyDetails,
	addPaymentMethodToCompany,
	editPaymentMethodInCompany,
	deletePaymentMethodInCompany,
} = require("./companies")

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

const {
	getAllPaymentMethods,
	createPaymentMethod,
	updatePaymentMethod,
	removePaymentMethod,
	getAllPaymentMethodsKeys,
	createPaymentMethodKeys,
	updatePaymentMethodKeys,
	removePaymentMethodKeys,
} = require('./paymentsMethods')

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
	getClientsApi,
	getAllPaymentMethods,
	createPaymentMethod,
	updatePaymentMethod,
	removePaymentMethod,
	getAllPaymentMethodsKeys,
	createPaymentMethodKeys,
	updatePaymentMethodKeys,
	removePaymentMethodKeys,
	getCompanies,
	getCompany,
	createCompany,
	deleteCompany,
	editCompanyDetails,
	addPaymentMethodToCompany,
	editPaymentMethodInCompany,
	deletePaymentMethodInCompany,
}
