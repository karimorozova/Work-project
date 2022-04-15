const { Company } = require("../models")
const { createDir, removeDir } = require("../helpers/files")
const { company } = require("../enums")
const { moveFile } = require("../utils/movingFile")
const fs = require("fs")
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
	return Company.findById(id).populate('timeZone').populate('paymentMethods.paymentType')
}

const editCompanyBase = async (id, data) => {
	if (data?.isDefault) await Company.findOneAndUpdate({isDefault: true}, {isDefault: false})
	await Company.findByIdAndUpdate(id, data)
	return getCompanies()
}


async function getPhotoLink(id, file) {
	try {
		const newPath = await moveFile(file[0], PATH + `${ id }/${ file[0].filename }`)
		return newPath.split('./dist')[1]
	} catch (err) {
		console.log(err)
		console.log("Error in getPhotoLink")
	}
}

function removeOldVendorFile(oldPath, newPath) {
	if (oldPath === newPath || !oldPath) return
	return new Promise((resolve, reject) => {
		fs.unlink(`./dist${ oldPath }`, (err) => {
			if (err) {
				console.log(err)
				console.log("Error in removing Company photo")
				reject(err)
			}
		})
		resolve("removed")
	})
}

const editCompanyDetails = async (id, data, photoFile) => {
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

	if (photoFile) {
		if (data.photo) {
			let oldPath = data.photo
			await removeOldVendorFile(oldPath, data.photo)
		}
		data.photo = await getPhotoLink(id, photoFile)
	}

	await Company.findByIdAndUpdate(id, data)
	return getCompany(id)
}

const addPaymentMethodToCompany = async (companyId, data) => {
	await Company.findByIdAndUpdate(companyId, {$push: {paymentMethods: data}})
	return getCompany(companyId)
}

const editPaymentMethodInCompany = async (companyId, paymentMethodId, data) => {
	await Company.findByIdAndUpdate(companyId, { $set: { 'paymentMethods.$[i]': data } }, { arrayFilters: [ { 'i._id': paymentMethodId } ] })
	return getCompany(companyId)
}

const deletePaymentMethodInCompany = async (companyId, paymentMethodId) => {
	await Company.findByIdAndUpdate(companyId, { $pull: { 'paymentMethods':{_id: paymentMethodId }} })
	return getCompany(companyId)
}

const toggleDefaultPaymentMethod = async (companyId, paymentMethodId, status) => {
	await Company.findByIdAndUpdate(companyId, { 'paymentMethods.$[i].isDefault': status  }, { arrayFilters: [ { 'i._id': paymentMethodId } ] })
	return getCompany(companyId)
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
	editPaymentMethodInCompany,
	deletePaymentMethodInCompany,
	deleteCompany,
	toggleDefaultPaymentMethod,
}