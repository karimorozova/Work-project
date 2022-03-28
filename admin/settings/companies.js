const { Company } = require("../models")
const createCompany = async (companyName, officialCompanyName, isActive, isDefault) => {
	await Company.create({companyName, officialCompanyName, isActive, isDefault})
}

const editCompanyDetails = () => {

}

const addPaymentMethodToCompany = () => {

}

const deleteCompany = () => {

}

module.exports = {
	createCompany,
	editCompanyDetails,
	addPaymentMethodToCompany,
	deleteCompany,
}