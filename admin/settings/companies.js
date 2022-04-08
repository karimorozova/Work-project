const { Company } = require("../models")
const { createDir, removeDir } = require("../helpers/files")
const { company } = require("../enums")
const PATH = './dist/companies/'

const createCompany = async (companyName, officialCompanyName, isActive, isDefault) => {
	if (isDefault) await Company.findOneAndUpdate({isDefault: true}, {isDefault: false})

  const company = await Company.create({companyName, officialCompanyName, isActive, isDefault})
	await createDir(PATH, company._id.toString())
	return getCompanies()
}

const getCompanies = async () => {
	return Company.find({}, {companyName: 1, officialCompanyName: 1, isActive: 1, isDefault: 1})
}

const getCompany = async (id) => {
	return Company.findById(id).populate('paymentMethods.paymentType').populate('timeZone').populate('paymentMethods.paymentType.keys')
}

const editCompanyBase = async (id, data) => {
	await Company.findOneAndUpdate({isDefault: true}, {isDefault: false})
	await Company.findByIdAndUpdate(id, data)
	return getCompanies()
}

const editCompanyDetails = async (id, data) => {
	// const {
	// 	isActive,
	// 	isDefault,
	// 	_id,
	// 	companyName,
	// 	officialCompanyName,
	// 	financeEmail,
	// 	website,
	// 	phone,
	// 	timeZone,
	// 	mainCurrency,
	// 	companyId,
	// 	taxId,
	// 	country,
	// 	city,
	// 	address,
	// 	vat,
	// 	zipCode,
	// 	state
	// } = data
	await Company.findByIdAndUpdate(id, data)
	return getCompany(id)
}

const addPaymentMethodToCompany = async (companyId, data) => {
	await Company.findByIdAndUpdate(companyId, {$push: {paymentMethods: data}})
}

const editPaymentMethodToCompany = async (companyId, paymentId,data) => {
	await Company.updateOne(companyId, data)
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