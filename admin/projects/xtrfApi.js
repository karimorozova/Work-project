const { Projects } = require('../models/')
const axios = require("axios")
const request = require('request')

const { writeFileSync, readFileSync, createReadStream } = require('fs')
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
// const services = { Translation: 80, Compliance: 79, Copywriting: 81, NewsletterSMS: 81 }
const STEP_IDS = {
	Translation: {
		services: 80,
		calculationUnitId: 1,
		jobTypeId: 4,
	},
	Compliance: {
		services: 79,
		calculationUnitId: 11,
		jobTypeId: 67,
	},
	Copywriting: {
		services: 81,
		calculationUnitId: 6,
		jobTypeId: 69,
	},
	NewsletterSMS: {
		services: 81,
		calculationUnitId: 6,
		jobTypeId: 69,
	}
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
			accountManager,
			isTest,
		} = await Projects.findOne({ _id: vendorId }).populate('steps.vendor').populate('customer').populate("accountManager")

		const currentServices = getServices(tasks)

		const { stepsInfo, stepsSource, stepsTarget, noFoundVendors } = getStepInfo(allLanguages, steps, vendorPriceProfileId, vendors, currentServices.name)


		const allCustomer = await sendRequest('get', 'customers')
		const customers = findInXtrf(allCustomer, "name", customer.name)
		if (!customers) {
			return { isSuccess: false, message: errorMessages['cannotFindClient'] }
		}

		const xtrfProjectInfo = await sendRequest('Post', 'v2/projects', {
			name: `${ projectId }: ${ projectName }`,
			clientId: customers.id,
			serviceId: currentServices.id
		})

		// IS test true
		await sendRequest('Put', `v2/projects/${ xtrfProjectInfo.data.projectId }/customFields/Test Project`, { value: isTest })

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

		await setProjectFinance(xtrfProjectInfo.data.projectId, stepsInfo, currentServices.name)

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

function getServices(tasks) {
	try {
		const uniqueServices = Array.from(new Set(tasks.map(({ service }) => service.title)))

		const currentServices = uniqueServices.sort((a, b) => a.localeCompare(b)).join('')
		const service = currentServices ? STEP_IDS[currentServices].services : false
		if (!service) {
			return { isSuccess: false, message: errorMessages['cannotFindServices'] }
		}
		return { id: service, name: currentServices }
	}catch (e) {
		throw new Error( errorMessages['cannotFindServices'])
	}
}

function getStepInfo(allLanguages, steps, vendorPriceProfileId, vendors, currentServicesName) {
	let stepsInfo = {}
	let stepsSource = new Set()
	let stepsTarget = new Set()
	let noFoundVendors = new Set()
	steps = steps.filter(({status}) => status !== 'Cancelled' && status !== 'Cancelled Halfway')
	for (let { sourceLanguage, targetLanguage, finance, nativeFinance, vendor, serviceStep, _id } of steps) {
		const sourceLang = findLanguageId(allLanguages, "symbol", sourceLanguage) ? findLanguageId(allLanguages, "symbol", sourceLanguage).id : ''
		const targetLang = findLanguageId(allLanguages, "symbol", targetLanguage) ? findLanguageId(allLanguages, "symbol", targetLanguage).id : ''
		const vendorId = vendor ? vendors[vendor.firstName + " " + vendor.surname] : ''
		stepsSource.add(sourceLang)
		stepsTarget.add(targetLang)

		if (!vendorId) {
			noFoundVendors.add(vendor.firstName + " " + vendor.surname)
		}

		const subInfo = {
			payables: nativeFinance.Price.payables,
			vendor: vendorId ? vendorPriceProfileId[vendorId] : false,
			memoqAssignmentRole: serviceStep.memoqAssignmentRole != null ? serviceStep.memoqAssignmentRole + 1 : 1
		}
		const stepInfo = {
			receivables: finance.Price.receivables,
			subInfo: [ subInfo ]
		}
		if (stepsInfo.hasOwnProperty(sourceLang + ">>" + targetLang)) {
			if(currentServicesName === "NewsletterSMS") {
				stepsInfo[sourceLang + ">>" + targetLang].subInfo[0].payables += nativeFinance.Price.payables
			}else {
				stepsInfo[sourceLang + ">>" + targetLang].subInfo.push(subInfo)
			}

			stepsInfo[sourceLang + ">>" + targetLang].receivables += finance.Price.receivables
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

		const { languages } = elem
		const langPair = languages[0].sourceLanguageId + ">>" + languages[0].targetLanguageId

		if (tasks.hasOwnProperty(langPair)) {
			tasks[langPair].push(elem)
		} else {
			tasks[langPair] = [ elem ]
		}
	})

	for (let langPair in tasks) {
		const task = tasks[langPair]

		const { receivables, subInfo } = stepsInfo[langPair]

		const sourceLanguageId = task[0].languages[0].sourceLanguageId
		const targetLanguageId = task[0].languages[0].targetLanguageId

		const baseData = {
			"type": "SIMPLE",
			"languageCombination": {
				sourceLanguageId: sourceLanguageId,
				targetLanguageId: targetLanguageId
			},
			"calculationUnitId": STEP_IDS[currentServices].calculationUnitId,
			// "calculationUnitId": currentServices === "Translation" ? 1 : currentServices === "Copywriting" ? 6 : 11,
			"ignoreMinimumCharge": false,
			"description": "payable"
		}
		const receivablesData = {
			...baseData,
			"jobTypeId":  STEP_IDS[currentServices].jobTypeId,
			// "jobTypeId": currentServices === "Translation" ? 4 : currentServices === "Copywriting" ? 69 : 67,
			"rate": receivables,
			"quantity": 1
		}

		for await (let { id, stepNumber } of task) {
			const { payables, vendor } = subInfo.find((step) => step.memoqAssignmentRole === stepNumber)

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


const updateFianceXTRF = async (id) => {
	const allLanguages = await sendRequest('get', 'dictionaries/language/active')
	let vendorPriceProfileId = JSON.parse(await readFileSync(vendorPriceProfileIdPath))
	let vendors = JSON.parse(await readFileSync('./static/xtrf/Vendors.json'))
	const {
		startDate,
		deadline,
		xtrfLink,
		steps,
		tasks
	} = await Projects.findOne({ _id: id }).populate('steps.vendor')


	const re = /ProjectId=(.*)#/.exec(xtrfLink)
	const xtrfId = !!re ? re[1] : null
	const xtrfProjectJobs = await sendRequest('get', `v2/projects/${ xtrfId }/jobs`)
	await sendRequest('put', `v2/projects/${xtrfId}/clientDeadline`,{ "value": new Date(deadline).getTime() })

	for await (let jobId of xtrfProjectJobs.data.map(item => item.id)) await sendRequest('put', `v2/jobs/${ jobId }/dates`, {
		"startDate": new Date(startDate).getTime(),
		"deadline": new Date(deadline).getTime()
	})

	for await (let jobId of xtrfProjectJobs.data.map(item => item.id))
		for await (let status of ['ACCEPTED' , 'STARTED', 'READY'])
			await sendRequest('put', `v2/jobs/${ jobId }/status`, { status })

	const finance = await sendRequest('get', `v2/projects/${ xtrfId }/finance`)
	let { receivables, payables } = finance.data

	receivables = receivables.map(item => {
		if(item.rates == null) return item.id
	}).filter(Boolean)

	payables = payables.map(item => {
		if(item.rates == null) return item.id
	}).filter(Boolean)

	for await (let id of payables) await sendRequest('delete', `v2/projects/${xtrfId}/finance/payables/${id}`)
	for await (let id of receivables) await sendRequest('delete', `v2/projects/${xtrfId}/finance/receivables/${id}`)

	const { stepsInfo } = getStepInfo(allLanguages, steps, vendorPriceProfileId, vendors)
	// const currentServices = Array.from(new Set(tasks.map(({ service }) => service.title).filter((servicesTitle) => Object.keys(services).includes(servicesTitle)))).pop()
	const currentServices = getServices(tasks)
	await setProjectFinance(xtrfId, stepsInfo, currentServices.name)

}

	module.exports = { createXtrfProjectWithFinance, updateFianceXTRF }