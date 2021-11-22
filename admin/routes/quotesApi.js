const router = require('express').Router()
const { Projects } = require('../models')
const { getProject, updateWithApprovedTasks } = require('../projects')
const { getProjectManageToken } = require("../middleware")
const { sendQuoteToVendorsAfterProjectAccepted } = require('../utils')
const {
	getErrorTemplate,
	getSuccessTemplate
} = require("../emailMessages/otherCommunication")

const {
	quoteEmitter
} = require('../events/quote')

router.get('/client-decide-tasks', getProjectManageToken, async (req, res) => {
	let project = null
	const date = Date.now()
	let { from, projectId: _id, prop, t, tasksIds } = req.query
	const expiryInSeconds = Math.round((date - from) / 1000)
	tasksIds = tasksIds.replace(/['_']/g, ' ').split('*')

	try {
		project = await getProject({ _id })
	} catch (e) {
		res.send({ code: 6 })
		return
	}

	const { status, steps, tasks: allTasks } = project
	const neededSteps = steps.filter(item => tasksIds.includes(item.taskId))
	const neededTasks = allTasks.filter(item => tasksIds.includes(item.taskId))

	if (!neededTasks.length || !neededTasks.every(item => item.status === 'Quote sent')) {
		res.send({ code: 8 })
		return
	}
	if (status !== 'Approved' && status !== 'In progress') {
		res.send({ code: 7 })
		return
	}
	if (expiryInSeconds > 1800000) {
		res.send({ code: 4 })
		return
	}

	if (prop === 'accept') {
		const { tasks, steps } = updateWithApprovedTasks({ taskIds: tasksIds, project })
		await Projects.updateOne({ _id }, { $set: { tasks, steps } })
	}
	if (prop === 'reject') {
		const tasks = allTasks.map(task => {
			if (task.status === 'Quote sent') task.status = 'Rejected'
			return task
		})
		await Projects.updateOne({ _id }, { $set: { tasks } })
	}

	quoteEmitter.emit('client-decide-tasks', project, prop, neededSteps)
	prop === 'accept' ? res.send({ code: -1 }) : res.send({ code: -2 })
})

router.get('/vendor-decide', getProjectManageToken, async (req, res) => {
	let project = null
	const date = Date.now()
	const { vendorId, projectId: _id, stepId, from, prop } = req.query
	const expiryInSeconds = Math.round((date - from) / 1000)

	try {
		project = await getProject({ _id })
	} catch (e) {
		res.send({ code: 6 })
		return
	}
	if (expiryInSeconds > 86000) {
		res.send({ code: 4 })
		return
	}

	const currStep = project.steps.find(item => item._id.toString() === stepId.toString())

	if (currStep.vendor._id.toString() !== vendorId.toString()) {
		res.send({ code: 10 })
		return
	}
	if (currStep.vendorsClickedOffer.indexOf(vendorId) !== -1) {
		res.send({ code: 11 })
		return
	}
	if (currStep.status !== 'Request Sent') {
		res.send({ code: 13 })
		return
	}

	quoteEmitter.emit('vendor-decide', prop, project, vendorId, stepId)
	prop === 'accept' ? res.send({ code: -3 }) : res.send({ code: -2 })
})

router.get('/client-decide', getProjectManageToken, async (req, res) => {
	let project = null
	const date = Date.now()
	const { from, projectId: _id, prop, lengthThinkingTime } = req.query
	const expiryInSeconds = Math.round((date - from) / 1000)

	try {
		project = await getProject({ _id })
	} catch (e) {
		res.send({ code: 6 })
		return
	}

	let { isClientOfferClicked, status, tasks: allProjectTasks, deadline } = project

	if (expiryInSeconds > 1800000) {
		res.send({ code: 4 })
		return
	}
	if (isClientOfferClicked) {
		res.send({ code: 3 })
		return
	}
	if (status !== "Quote sent") {
		res.send({ code: 5 })
		return
	}

	if (prop === 'accept') {
		let { tasks, steps } = updateWithApprovedTasks({ taskIds: allProjectTasks.map(i => i.taskId), project })
		const newDeadline = +lengthThinkingTime + new Date(deadline).getTime()
		steps = steps.map(item => {
			const newDeadline = +lengthThinkingTime + new Date(item.deadline).getTime()
			item.deadline = new Date(newDeadline).toISOString()
			return item
		})
		await Projects.updateOne({ _id }, { $set: { startDate: new Date(), tasks, steps, deadline: new Date(newDeadline).toISOString(), status: "Approved", isClientOfferClicked: true } })
	}
	if (prop === 'reject') {
		const tasks = tasks.map(task => {
			if (task.status === 'Quote sent') task.status = 'Rejected'
			return task
		})
		await Projects.updateOne({ _id }, { $set: { startDate: new Date(), tasks, status: "Rejected", isClientOfferClicked: true } })
	}

	quoteEmitter.emit('client-decide', project, prop)
	prop === 'accept' ? res.send({ code: -1 }) : res.send({ code: -2 })
})

router.get('/get-success-message', async (req, res) => {
	let { code } = req.query
	let message = ''
	let title = ''
	let footer = ''
	code = code.toString()

	try {
		switch (code) {
			case '-1':
				title = 'Thank you'
				message = 'for accepting the quote'
				footer = 'Go to <a style="margin-left: 3px;" href="https://portal2.pangea.global/dashboard"> portal.pangea</a>'
				break
			case '-2':
				title = 'Quote rejected'
				message = ''
				break
			case '-3':
				title = 'Thank you'
				message = ''
				footer = 'Go to <a style="margin-left: 3px;" href="https://vendor2.pangea.global/dashboard"> vendor.pangea</a>'
				break
			default:
				title = 'ERROR CODE 0'
				message = 'System error, contact the system administrator.'
		}

		res.send(getSuccessTemplate(title, message, footer))
	} catch (err) {
		console.log(err, 'at get-success-message')
	}
})

router.get('/get-error-message', async (req, res) => {
	let { code } = req.query
	if (!code) code = 12
	code = code.toString()
	let message = ''

	try {
		switch (code) {
			case '1':
				message = 'Data processing error, contact the manager.'
				break
			case '2':
				message = 'Jobs data processing error, contact the manager.'
				break
			case '3':
				message = 'The choice has already been made.'
				break
			case '4':
				message = 'Token expired. Resend the quote.'
				break
			case '5':
				message = 'The project is not in quote status.'
				break
			case '6':
				message = 'The project does not exist.'
				break
			case '7':
				message = 'Additional jobs cannot be confirmed. The project is not in progress.'
				break
			case '8':
				message = 'Additional jobs cannot be confirmed. The Jobs is not in quote status.'
				break
			case '9':
				message = 'Job data processing error, contact the manager.'
				break
			case '10':
				message = 'You are not assigned to this job.'
				break
			case '11':
				message = 'You already made your decision.'
				break
			case '12':
				message = 'No access to view the page.'
				break
			case '13':
				message = 'The job is not in quote status.'
				break
			default:
				code = '0'
				message = 'System error, contact the system administrator.'
		}

		res.send(getErrorTemplate(code, message))
	} catch (err) {
		console.log(err, 'at get-error-message')
	}
})

router.get('/vendor-data-to-display', getProjectManageToken, async (req, res) => {
	const { projectId: _id, stepId } = req.query
	try {
		const { projectName, projectId, industry: { name: industry }, steps } = await getProject({ _id })
		const currStep = steps.find(item => item._id.toString() === stepId.toString())

		const data = {
			projectName,
			projectId,
			industry,
			deadline: currStep.deadline,
			amount: (currStep.nativeFinance.Price.payables).toFixed(2),
			services: currStep.step.title,
			languages: currStep.sourceLanguage === currStep.targetLanguage ? currStep.targetLanguage : currStep.sourceLanguage + ' >> ' + currStep.targetLanguage,
			projectCurrency: 'EUR'
		}

		res.send(data)
	} catch (err) {
		console.log(err, 'at /vendor-data-to-display')
	}
})

router.get('/client-data-to-display', getProjectManageToken, async (req, res) => {
	const { projectId: _id } = req.query
	try {
		const { projectName, projectId, industry: { name: industry }, steps, finance, projectCurrency, deadline } = await getProject({ _id })
		const services = [ ...new Set(steps.map(i => i.step.title)) ].join(', ')
		const languages = [ ...new Set(steps.map(i => i.targetLanguage)) ].join(', ')

		const data = {
			projectName,
			projectId,
			industry,
			amount: finance.Price.receivables,
			services,
			languages,
			projectCurrency,
			deadline
		}

		res.send(data)
	} catch (err) {
		console.log(err, 'at /client-data-to-display')
	}
})

router.get('/client-data-tasks-to-display', getProjectManageToken, async (req, res) => {
	let { projectId: _id, tasksIds } = req.query
	try {
		tasksIds = tasksIds.replace(/['_']/g, ' ').split('*')
		const { projectName, projectId, industry: { name: industry }, steps: allSteps, projectCurrency, deadline } = await getProject({ _id })
		const steps = allSteps.filter(i => tasksIds.includes(i.taskId))
		const services = [ ...new Set(steps.map(i => i.step.title)) ].join(', ')
		const languages = [ ...new Set(steps.map(i => i.targetLanguage)) ].join(', ')
		const amount = steps.reduce((a, c) => a + c.finance.Price.receivables, 0).toFixed(2)

		const data = {
			projectName,
			projectId,
			industry,
			amount,
			services,
			languages,
			projectCurrency,
			deadline
		}

		res.send(data)
	} catch (err) {
		console.log(err, 'at /client-data-tasks-to-display')
	}
})

module.exports = router
