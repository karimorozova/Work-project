const { Projects } = require('../models/')
const axios = require("axios")
const request = require('request')

const {  writeFileSync, readFileSync, createReadStream } = require('fs')
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
		writeFileSync(vendorPriceProfileIdPath, JSON.stringify(a))
	})
}

const errorMessages = {
	cannotCreateVendors: "Sorry! But we can not find some vendors: ",
	cannotFindClient: "Sorry! We can not find client",
	cannotFindServices: "Sorry! We can not find services",
	cannotFindLanguage: "Sorry! We can not find language pair",
	cannotSendProject: "Sorry! We can not send the project to XTRF"
}

const createXtrfProjectWithFinance = async (vendorId) => {
	try {
		// csvToJsonXtrf()

		// getAllVendors()

		// if (!existsSync(vendorPriceProfileIdPath)) {
		// 	await csvToJsonXtrf()
		// }

		let vendorPriceProfileId = JSON.parse(await readFileSync(vendorPriceProfileIdPath))

		let vendors = JSON.parse(await readFileSync('./static/xtrf/Vendors.json'))

		const allLanguages = await sendRequest('get', 'dictionaries/language/active')

		const {
			projectId,
			projectName,
			customer,
			steps,
			tasks,
			accountManager
		} = await Projects.findOne({ _id: vendorId }).populate('steps.vendor').populate('customer').populate("accountManager")
		const { stepsInfo, stepsSource, stepsTarget, noFoundVendors } = getStepInfo(allLanguages, steps, vendorPriceProfileId, vendors)


		const services = { Translation: 80, Compliance: 79 }
		const currentServices = Array.from(new Set(tasks.map(({ service }) => service.title).filter((servicesTitle) => Object.keys(services).includes(servicesTitle)))).pop()
		const service = currentServices ? services[currentServices] : false
		if (!services) {
			return { isSuccess: false, message: errorMessages['cannotFindServices'] }
		}

		const allCustomer = await sendRequest('get', 'customers')
		const customers = findInXtrf(allCustomer, "name", customer.name)
		if (!customers) {
			return { isSuccess: false, message: errorMessages['cannotFindClient'] }
		}

		const xtrfProjectInfo = await sendRequest('Post', 'v2/projects', {
			name: `Api| ${ projectId }: ${ projectName }`,
			clientId: customers.id,
			serviceId: service
		})

		// IS test true
		await sendRequest('Put', `v2/projects/${ xtrfProjectInfo.data.projectId }/customFields/Test Project`, { value: true })

		// Set AM
		try {
			if (accountManager.firstName && accountManager.lastName) {
				await sendRequest('Put', `v2/projects/${ xtrfProjectInfo.data.projectId }/customFields/Account Manager1`, { value: accountManager.firstName + ' ' + accountManager.lastName })
			}
		} catch (e) {
		}


		await sendRequest('put', `v2/projects/${ xtrfProjectInfo.data.projectId }/sourceLanguage`, {
			sourceLanguageId: stepsSource.pop()
		})

		await sendRequest('put', `v2/projects/${ xtrfProjectInfo.data.projectId }/targetLanguages`, {
			targetLanguageIds: stepsTarget
		})

		await setProjectFinance(xtrfProjectInfo.data.projectId, stepsInfo, currentServices)

		await Projects.updateOne(
				{ _id: vendorId },
				{
					isSendToXtrf: true,
					xtrfLink: `https://pangea.s.xtrf.eu/xtrf/faces/projectAssistant/projects/project.seam?assistedProjectId=${ xtrfProjectInfo.data.projectId }#/project`
				}
		)

		return { isSuccess: true, message: "id: " + xtrfProjectInfo.data.projectId, noFoundVendors }
	} catch (e) {
		return { isSuccess: false, message: e.message }
	}

}

function getStepInfo(allLanguages, steps, vendorPriceProfileId, vendors) {
	let stepsInfo = {}
	let stepsSource = new Set()
	let stepsTarget = new Set()
	let noFoundVendors = new Set()
	for (let { sourceLanguage, targetLanguage, finance, vendor, serviceStep, _id } of steps) {
		const sourceLang = findLanguageId(allLanguages, "symbol", sourceLanguage) ? findLanguageId(allLanguages, "symbol", sourceLanguage).id : ''
		const targetLang = findLanguageId(allLanguages, "symbol", targetLanguage) ? findLanguageId(allLanguages, "symbol", targetLanguage).id : ''
		const vendorId = vendor ? vendors[vendor.firstName + " " + vendor.surname] : ''
		stepsSource.add(sourceLang)
		stepsTarget.add(targetLang)

		if (!vendorId) {
			noFoundVendors.add(vendor.firstName + " " + vendor.surname)
		}

		const subInfo =  {
			payables: finance.Price.payables,
			vendor: vendorId ? vendorPriceProfileId[vendorId] : false,
			memoqAssignmentRole: serviceStep.memoqAssignmentRole != null ?  serviceStep.memoqAssignmentRole+1 : 1
		}
		const stepInfo = {
			receivables: finance.Price.receivables,
			subInfo: [subInfo]
		}
		if (stepsInfo.hasOwnProperty(sourceLang + ">>" + targetLang)) {
			stepsInfo[sourceLang + ">>" + targetLang].subInfo.push(subInfo)
			stepsInfo[sourceLang + ">>" + targetLang].receivables +=  finance.Price.receivables
		} else {
			stepsInfo[sourceLang + ">>" + targetLang] = stepInfo
		}

	}

	return { stepsInfo, stepsSource: Array.from(stepsSource), stepsTarget: Array.from(stepsTarget), noFoundVendors: Array.from(noFoundVendors) }
}

async function setProjectFinance(xtrfProjectId, stepsInfo, currentServices) {
	const xtrfProjectJobs = await sendRequest('get', `v2/projects/${ xtrfProjectId }/jobs`)
	let tasks = {}
	xtrfProjectJobs.data.forEach((elem) => {

		const {languages} = elem
		const langPair = languages[0].sourceLanguageId + ">>" + languages[0].targetLanguageId

		if(tasks.hasOwnProperty(langPair)) {
			tasks[langPair].push(elem)
		}else  {
			tasks[langPair] = [elem]
		}

	})

	for (let langPair in tasks) {
		const task = tasks[langPair]

		const { receivables, subInfo} =  stepsInfo[langPair]

		const sourceLanguageId = task[0].languages[0].sourceLanguageId
		const targetLanguageId = task[0].languages[0].targetLanguageId

		const baseData = {
			"type": "SIMPLE",
			"languageCombination": {
				sourceLanguageId: sourceLanguageId,
				targetLanguageId: targetLanguageId
			},
			"calculationUnitId":  currentServices === "Translation" ? 1 : 11,
			"ignoreMinimumCharge": false,
			"description": "payable"
		}

		const receivablesData = {
			...baseData,
			"jobTypeId": currentServices === "Translation" ? 4 : 67,
			"rate": receivables,
			"quantity": 1
		}

		for await (let { id, stepNumber } of task) {
			const {payables, vendor} = subInfo.find((step ) => step.memoqAssignmentRole === stepNumber)

			const payablesData = {
				...baseData,
				"jobId": id,
				"rate": payables,
				"quantity": 1
			}

			if (!!vendor) {
				await sendRequest('put', `v2/jobs/${ id }/vendor`, { vendorPriceProfileId: vendor })
			}

			await sendRequest('post', `v2/projects/${ xtrfProjectId }/finance/payables`, payablesData)

		}



		await sendRequest('post', `v2/projects/${ xtrfProjectId }/finance/receivables`, receivablesData)
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

function findInXtrf(response, field, value) {
	if (!value) return false
	const found = response.data.filter((elem) => elem[field].toLowerCase() === value.toLowerCase())
	return Array.isArray(found) ? found[0] : found
}

function findLanguageId(response, field, value) {
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