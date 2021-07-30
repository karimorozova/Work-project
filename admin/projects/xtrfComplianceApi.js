const { Projects } = require('../models/')
const axios = require("axios")


const { readFileSync, createReadStream } = require('fs')


const apiDomain = "https://pangea.s.xtrf.eu/home-api/"
const token = "YnMTG15t9lCKQWRuv7bZvWMHR9"
const vendorPriceProfileIdPath = './static/xtrf/ProfilePaymentID.json'

const options = {
	url: apiDomain + 'customers',
	headers: {
		'X-AUTH-ACCESS-TOKEN': token
	}
}

const STEP_IDS = {
	Compliance: {
		services: 79,
		calculationUnitId: 11,
		jobTypeId: 67,
	},
}

const createSendAllTasksToXtrf = async (projectId) => {
	let { xtrfLinks, tasks } = await Projects.findOne({_id: projectId})
	const taskIds = tasks.map(item => item.taskId)
	const notSentTasks = taskIds.filter(item => !xtrfLinks.map(item => item.taskId).includes(item))
	for await (let taskId of notSentTasks) {
		const sentTaskInfo = await createXtrf(projectId, taskId)
		xtrfLinks.push( sentTaskInfo)
	}

	const isAllSend = taskIds.length === xtrfLinks.length

	await Projects.updateOne(
			{ _id: projectId },
			{
				isSendToXtrf: isAllSend,
				xtrfLinks: xtrfLinks
			}
	)


}

const createXtrf = async (projId, taskId) => {

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
	} = await Projects.findOne({ _id: projId }).populate('steps.vendor').populate('customer').populate("accountManager")

	const currentServices = {name: 'Compliance', id: 79}
	const currentStep = steps.find(item=> item.taskId === taskId  )
	const vendorId = currentStep.vendor ? vendors[currentStep.vendor.firstName + " " + currentStep.vendor.surname] : ''

	const stepsSource = findLanguageId(allLanguages, "symbol", currentStep.sourceLanguage) ? findLanguageId(allLanguages, "symbol", currentStep.sourceLanguage).id : ''
	const stepsTarget = findLanguageId(allLanguages, "symbol", currentStep.targetLanguage) ? findLanguageId(allLanguages, "symbol", currentStep.targetLanguage).id : ''

	const stepsInfo = {
		[stepsSource + ">>" + stepsTarget]: {
			receivables: currentStep.finance.Price.receivables,
			subInfo: {
				payables: currentStep.nativeFinance.Price.payables,
				vendor: vendorId ? vendorPriceProfileId[vendorId] : false,
			}
		}
	}

	const allCustomer = await sendRequest('get', 'customers')
	let customers = findInXtrf(allCustomer, "name", customer.name)

	if (!customers) {
		customers = {id: 995}
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
		sourceLanguageId: stepsSource
	})

	await sendRequest('put', `v2/projects/${ xtrfProjectInfo.data.projectId }/targetLanguages`, {
		targetLanguageIds: [stepsTarget]
	})

	await setProjectFinance(xtrfProjectInfo.data.projectId, stepsInfo, currentServices.name)

	return  {taskId, xtrfId: xtrfProjectInfo.data.projectId, link:`https://pangea.s.xtrf.eu/xtrf/faces/projectAssistant/projects/project.seam?assistedProjectId=${ xtrfProjectInfo.data.projectId }#/project` }
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
			"ignoreMinimumCharge": false,
			"description": "payable"
		}
		const receivablesData = {
			...baseData,
			"jobTypeId":  STEP_IDS[currentServices].jobTypeId,
			"rate": receivables,
			"quantity": 1
		}

		for await (let { id, stepNumber } of task) {
			const { payables, vendor } = subInfo

			const payablesData = {
				...baseData,
				"jobId": id,
				"rate": payables,
				"quantity": 1
			}

			await sendRequest('post', `v2/projects/${ xtrfProjectId }/finance/payables`, payablesData)
		}
		await sendRequest('post', `v2/projects/${ xtrfProjectId }/finance/receivables`, receivablesData)
	}
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


const updateTaskFianceXTRF = async (id, xtrfId, taskId) => {
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


	const xtrfProjectJobs = await sendRequest('get', `v2/projects/${ xtrfId }/jobs`)
	await sendRequest('put', `v2/projects/${xtrfId}/clientDeadline`,{ "value": new Date(deadline).getTime() })


	for await (let jobId of xtrfProjectJobs.data.map(item => item.id)) await sendRequest('put', `v2/jobs/${ jobId }/dates`, {
		"startDate": new Date(startDate).getTime(),
		"deadline": new Date(deadline).getTime()
	})

	const currentStep = steps.find(item=> item.taskId === taskId  )
	const vendorId = currentStep.vendor ? vendors[currentStep.vendor.firstName + " " + currentStep.vendor.surname] : ''

	if (!!vendorId && !!vendorPriceProfileId[vendorId]) {
		await sendRequest('put', `v2/jobs/${ xtrfProjectJobs.data[0].id }/vendor`, { vendorPriceProfileId: vendorPriceProfileId[vendorId] })
	}

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

	const stepsSource = findLanguageId(allLanguages, "symbol", currentStep.sourceLanguage) ? findLanguageId(allLanguages, "symbol", currentStep.sourceLanguage).id : ''
	const stepsTarget = findLanguageId(allLanguages, "symbol", currentStep.targetLanguage) ? findLanguageId(allLanguages, "symbol", currentStep.targetLanguage).id : ''

	const stepsInfo = {
		[stepsSource + ">>" + stepsTarget]: {
			receivables: currentStep.finance.Price.receivables,
			subInfo: {
				payables: currentStep.nativeFinance.Price.payables,
				vendor: vendorId ? vendorPriceProfileId[vendorId] : false,
			}
		}
	}

	const currentServices = {name: 'Compliance', id: 79}


	await setProjectFinance(xtrfId, stepsInfo, currentServices.name)

}


module.exports = { createSendAllTasksToXtrf, updateTaskFianceXTRF }