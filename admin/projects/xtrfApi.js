const { Projects } = require('../models/')
const axios = require("axios")
const request = require('request')

const { existsSync, writeFileSync, readFileSync, createReadStream } = require('fs')
const csv = require('csv-parser')

const apiDomain = "https://pangea.s.xtrf.eu/home-api/"
const token = "YnMTG15t9lCKQWRuv7bZvWMHR9"
const vendorPriceProfileIdPath = './static/xtrf/ProfilePaymentID.json'

const options = {
	url: apiDomain + 'customers',
	headers: {
		'X-AUTH-ACCESS-TOKEN': token
	}
}

const csvToJsonXtrf = () => {
	let a = {}
	createReadStream('./static/xtrf/ProfilePaymentID1.csv').pipe(csv(
			{ separator: ',' }
	)).on('data', (data) => {
		const [ val, key ] = Object.values(data)
		a[key] = val
	}).on('end', () => {
		console.log(vendorPriceProfileIdPath)
		writeFileSync(vendorPriceProfileIdPath, JSON.stringify(a))
	})
}

const createXtrfProjectWithFinance = async (vendorId) => {
	try {
		// csvToJsonXtrf()
		//
		// getAllVendors()
		// if (!existsSync(vendorPriceProfileIdPath)) {
		// 	await csvToJsonXtrf()
		// }

		let vendorPriceProfileId = JSON.parse(await readFileSync(vendorPriceProfileIdPath))

		let vendors = JSON.parse(await readFileSync('./static/xtrf/Vendors.json'))
		// let vendors = {}

		const allLanguages = await sendRequest('get', 'dictionaries/language/active')

		const { projectId, projectName, customer, steps } = await Projects.findOne({ _id: vendorId }).populate('steps.vendor').populate('customer')
		const { stepsInfo, stepsSource, stepsTarget, noFoundVendors } = getStepInfo(allLanguages, steps, vendorPriceProfileId, vendors)

		// const allServices = await sendRequest('get', 'services/all')
		// const service = findInXtrf(allServices, "name", "Translation")
		const service = { id: 79 }

		const allCustomer = await sendRequest('get', 'customers')
		const customers = findInXtrf(allCustomer, "name", customer.name)
		if (!customers) {
			return {isSuccess: false, message: 'Client was not find'}
		}

		const xtrfProjectInfo = await sendRequest('Post', 'v2/projects', {
			name: `Test step in Api proj| ${ projectId }: ${ projectName }`,
			clientId: customers.id,
			serviceId: service.id
		})

		// IS test true
		await sendRequest('Put', `v2/projects/${ xtrfProjectInfo.data.projectId }/customFields/Test Project`, { value: true })

		console.log(xtrfProjectInfo.data.projectId)

		// for(let stepSource of  stepsSource) {
		// 	await sendRequest('put', `v2/projects/${ xtrfProjectInfo.data.projectId }/sourceLanguage`, {
		// 		sourceLanguageId: stepSource
		// 	})
		// }

		await sendRequest('put', `v2/projects/${ xtrfProjectInfo.data.projectId }/sourceLanguage`, {
			sourceLanguageId: stepsSource.pop()
		})

		await sendRequest('put', `v2/projects/${ xtrfProjectInfo.data.projectId }/targetLanguages`, {
			targetLanguageIds: stepsTarget
		})

		await setProjectFinance(xtrfProjectInfo.data.projectId, stepsInfo)

		await Projects.updateOne({ _id: vendorId }, { isSendToXtrf: true })

		return {isSuccess: true, message: "id: " + xtrfProjectInfo.data.projectId, noFoundVendors }
	} catch (e) {
		console.log(e)
		return {isSuccess: false, message: e.message}
	}

}

function getStepInfo(allLanguages, steps, vendorPriceProfileId, vendors) {
	let stepsInfo = {}
	let stepsSource = new Set()
	let stepsTarget = new Set()
	let noFoundVendors = new Set()
	for (let { sourceLanguage, targetLanguage, finance, vendor, _id } of steps) {
		const sourceLang = findLanguageId(allLanguages, "symbol", sourceLanguage) ? findLanguageId(allLanguages, "symbol", sourceLanguage).id : ''
		const targetLang = findLanguageId(allLanguages, "symbol", targetLanguage) ? findLanguageId(allLanguages, "symbol", targetLanguage).id : ''
		const vendorId = vendor ? vendors[vendor.firstName + " " + vendor.surname] : ''
		stepsSource.add(sourceLang)
		stepsTarget.add(targetLang)

		if (!vendorId) {
			noFoundVendors.add(vendor.firstName + " " + vendor.surname)
		}

		if (stepsInfo.hasOwnProperty(sourceLang + ">>" + targetLang)) {
			const currentStepInfo =  stepsInfo[sourceLang + ">>" + targetLang]
			currentStepInfo.payables = currentStepInfo.payables + finance.Price.payables
			currentStepInfo.receivables = currentStepInfo.receivables + finance.Price.receivables
		} else {
			stepsInfo[sourceLang + ">>" + targetLang] = {
				receivables: finance.Price.receivables,
				payables: finance.Price.payables,
				sourceLanguage: sourceLang,
				targetLanguage: targetLang,
				vendor: vendorId ? vendorPriceProfileId[vendorId] : false
			}
		}

	}
	return { stepsInfo, stepsSource: Array.from(stepsSource), stepsTarget: Array.from(stepsTarget), noFoundVendors: Array.from(noFoundVendors) }
}

async function setProjectFinance(xtrfProjectId, stepsInfo) {
	const xtrfProjectJobs = await sendRequest('get', `v2/projects/${ xtrfProjectId }/jobs`)
	for (let { id, languages } of xtrfProjectJobs.data) {
		const { sourceLanguage, targetLanguage, payables, receivables, vendor } = stepsInfo[languages[0].sourceLanguageId + ">>" + languages[0].targetLanguageId]
			const baseData = {
				"type": "SIMPLE",
				"languageCombination": {
					sourceLanguageId: sourceLanguage,
					targetLanguageId: targetLanguage
				},
				"calculationUnitId": 11,
				"ignoreMinimumCharge": false,
				"description": "payable"
			}

			const payablesData = {
				...baseData,
				"jobId": id,
				"rate": payables,
				"quantity": 1,
			}
			const receivablesData = {
				...baseData,
				"jobTypeId": 1,
				"rate": receivables,
				"quantity": 1
			}
			try {

			if (!!vendor) {
				await sendRequest('put', `v2/jobs/${ id }/vendor`, { vendorPriceProfileId: vendor })
			}

				await sendRequest('post', `v2/projects/${ xtrfProjectId }/finance/receivables`, receivablesData)

				await sendRequest('post', `v2/projects/${ xtrfProjectId }/finance/payables`, payablesData)

			} catch (e) {
			}


	}
}

async function getAllVendors() {
	let allVendors = {}
	const allVendorIds = await sendRequest('get', 'providers/ids')
	for (let id of allVendorIds.data) {
		const { data } = await sendRequest('get', `providers/${ id }`)
		allVendors[data.name] = id
	}

	await writeFileSync('./static/xtrf/Vendors.json', JSON.stringify(allVendors))
}

function findInXtrf(response, field, value, fieldName) {
	if (!value) return false
	const found = response.data.filter((elem) => elem[field].toLowerCase() === value.toLowerCase())
	return Array.isArray(found) ? found[0] : found
}

function findLanguageId(response, field, value, fieldName) {
	if (!value) return false
	const found = response.data.filter((elem) => elem[field].toLowerCase().includes(value.toLowerCase()))
	return Array.isArray(found) ? found[0] : found
}

async function sendRequest(method, path, data) {
	try {
		return (await axios({
			headers: { 'X-AUTH-ACCESS-TOKEN': token },
			method,
			url: apiDomain + path,
			data
		}))
	} catch (e) {
		console.log(e)
	}

}

module.exports = { createXtrfProjectWithFinance }