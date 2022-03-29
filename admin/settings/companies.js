const { Company } = require("../models")
const createCompany = async (companyName, officialCompanyName, isActive, isDefault) => {
  await Company.create({companyName, officialCompanyName, isActive, isDefault})
	return getCompanies()
}

const getCompanies = async () => {
	return Company.find()
}

const editCompanyBase = () => {

}

const editCompanyDetails = () => {

}

const addPaymentMethodToCompany = () => {

}

const deleteCompany = async (id) => {
	await Company.findByIdAndDelete(id)
	return getCompanies()
}

module.exports = {
	createCompany,
	getCompanies,
	editCompanyBase,
	editCompanyDetails,
	addPaymentMethodToCompany,
	deleteCompany,
}