const { Company } = require("../models")
const { createDir, removeDir } = require("../helpers/files")
const PATH = './dist/companies/'

const createCompany = async (companyName, officialCompanyName, isActive, isDefault) => {
  const company = await Company.create({companyName, officialCompanyName, isActive, isDefault})
	await createDir(PATH, company._id.toString())
	return getCompanies()
}

const getCompanies = async () => {
	return Company.find({}, {companyName: 1, officialCompanyName: 1, isActive: 1, isDefault: 1})
}

const getCompany = async (id) => {
	return Company.findById(id)
}

const editCompanyBase = () => {

}

const editCompanyDetails = () => {

}

const addPaymentMethodToCompany = () => {

}

const deleteCompany = async (id) => {
	await Company.findByIdAndDelete(id)
	await removeDir(PATH, id.toString())
	return getCompanies()
}

module.exports = {
	createCompany,
	getCompanies,
	getCompany,
	editCompanyBase,
	editCompanyDetails,
	addPaymentMethodToCompany,
	deleteCompany,
}