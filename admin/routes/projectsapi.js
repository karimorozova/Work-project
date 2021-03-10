const router = require('express').Router()
const { Projects } = require('../models')
const { getProject, updateProjectStatus, updateWithApprovedTasks } = require('../projects')
const { emitter } = require('../events')
const { getProjectManageToken } = require("../middleware")
const { notifyManagerProjectStarts } = require('../utils')
const {
	generateTemplateForAcceptQuote,
	generateTemplateForRejectQuote,
	generateTemplateForAlertAcceptQuote,
	generateTemplateForAlertRejectQuote,
	generateTemplateForDefaultMessage,
	generateTemplateForTasksAcceptOrRejectQuote,
	generateTemplateForAlertForTasksAcceptOrRejectQuote,
	generateTemplateForTasksAcceptOrRejectVendor,
	generateTemplateForAlertTasksAcceptOrRejectVendor
} = require("../emailMessages/otherCommunication")

router.get('/pangea-re-survey-page-accept-decline-tasks-quote', getProjectManageToken, async (req, res) => {
	const originalUrl = req.originalUrl.replace('pangea-re-survey-page-', '')
	let { projectId, prop, tasksIds } = req.query
	const [ currentProject ] = await Projects.find({ "_id": projectId }).populate('industry')
	tasksIds = tasksIds.replace(/[%]/g, ' ')
	tasksIds = tasksIds.split(';')
	tasksIds.pop()
	const currentTasks = currentProject.tasks.filter(({ taskId }) => tasksIds.includes(taskId.toString()))
	if (currentTasks.every(({ status }) => status === 'Quote sent')) {
		const template = generateTemplateForTasksAcceptOrRejectQuote(currentProject, tasksIds, prop, originalUrl)
		res.send(template)
	} else {
		return res.send(generateTemplateForDefaultMessage('Sorry. Link is not valid anymore.'))
	}
})

router.get('/accept-decline-tasks-quote', getProjectManageToken, async (req, res) => {
	let { to: mailDate, tasksIds, prop, projectId } = req.query
	const [ currentProject ] = await Projects.find({ "_id": projectId }).populate('industry')
	const date = Date.now()
	const expiryInSeconds = Math.round((date - mailDate) / 1000)
	try {
		if (expiryInSeconds > 1800000) {
			res.send(generateTemplateForDefaultMessage('Sorry! The link is already expired.'))
		} else {
			const project = await getProject({ "_id": projectId })
			let { tasks, steps } = project
			tasksIds = tasksIds.replace(/[%]/g, ' ')
			tasksIds = tasksIds.split(';')
			tasksIds.pop()
			if (prop === 'Rejected') {
				const neededSteps = steps.filter(step => tasksIds.includes(step.taskId)).map(step => step._id)
				steps = steps.map(step => {
					if (neededSteps.includes(step._id)) {
						step.status = prop
					}
					return step
				})
			}
			tasks = tasks.map(task => {
				if (task.status === 'Quote sent' && tasksIds.includes(task.taskId)) {
					task.status = prop
				}
				return task
			})
			await Projects.updateOne({ "_id": projectId }, { isClientOfferClicked: true, tasks, steps })
			prop === 'Rejected' ?
					emitter.emit('projectRejectedNotification', project) :
					emitter.emit('projectApprovedNotification', project)
			res.send(generateTemplateForAlertForTasksAcceptOrRejectQuote(currentProject, tasksIds, prop))
		}
	} catch (err) {
		console.log(err)
		res.send(generateTemplateForDefaultMessage('Sorry. Try again later.'))
	}
})

router.get('/pangea-re-survey-page-acceptquote', getProjectManageToken, async (req, res) => {
	const originalUrl = req.originalUrl.replace('pangea-re-survey-page-', '')
	const { projectId } = req.query
	const [ currentProject ] = await Projects.find({ "_id": projectId }).populate('industry')
	const template = generateTemplateForAcceptQuote(currentProject, `${ originalUrl }`)
	res.send(template)
})

router.get('/acceptquote', getProjectManageToken, async (req, res) => {
	const { to: mailDate, projectId } = req.query
	const [ currentProject ] = await Projects.find({ "_id": projectId }).populate('industry')
	const date = Date.now()
	const expiryInSeconds = Math.round((date - mailDate) / 1000)
	try {
		if (expiryInSeconds > 1800000) {
			res.send(generateTemplateForDefaultMessage('Sorry! The link is already expired.'))
		} else {
			const project = await getProject({ "_id": projectId })
			if (project.isClientOfferClicked || project.status !== "Quote sent") {
				return res.send(generateTemplateForDefaultMessage('Sorry. Link is not valid anymore.'))
			}
			await notifyManagerProjectStarts(project)

			const { tasks, steps } = updateWithApprovedTasks({ taskIds: project.tasks.map(i => i.taskId), project })
			await Projects.updateOne({ "_id": projectId }, { $set: { tasks, steps, status: "Approved", isClientOfferClicked: true } })
			res.send(generateTemplateForAlertAcceptQuote(currentProject))
		}
	} catch (err) {
		console.log(err)
		res.send(generateTemplateForDefaultMessage('Sorry. Acception failed! Try again later.'))
	}
})

router.get('/pangea-re-survey-page-declinequote', async (req, res) => {
	const originalUrl = req.originalUrl.replace('pangea-re-survey-page-', '')
	const { projectId } = req.query
	const [ currentProject ] = await Projects.find({ "_id": projectId }).populate('industry')
	const template = generateTemplateForRejectQuote(currentProject, `${ originalUrl }`)
	res.send(template)
})

router.get('/declinequote', async (req, res) => {
	const { to: mailDate, projectId } = req.query
	const [ currentProject ] = await Projects.find({ "_id": projectId }).populate('industry')
	const date = Date.now()
	const expiryInSeconds = Math.round((date - mailDate) / 1000)
	try {
		if (expiryInSeconds > 1800000) {
			res.send(generateTemplateForDefaultMessage('Sorry! The link is already expired.'))
		} else {
			const project = await getProject({ "_id": projectId })
			if (project.isClientOfferClicked || project.status !== "Quote sent") {
				return res.send(generateTemplateForDefaultMessage('Sorry. Link is not valid anymore.'))
			}
			emitter.emit('projectRejectedNotification', project)
			const tasks = project.tasks.map(task => {
				if (task.status === 'Quote sent') task.status = 'Rejected'
				return task
			})
			await Projects.updateOne({ "_id": projectId }, { $set: { tasks, status: "Rejected", isClientOfferClicked: true } })
			res.send(generateTemplateForAlertRejectQuote(currentProject))
		}
	} catch (err) {
		console.log(err)
		res.send(generateTemplateForDefaultMessage('Sorry. Try again later.'))
	}
})

router.get('/pangea-re-survey-page-step-decision', getProjectManageToken, async (req, res) => {
	const originalUrl = req.originalUrl.replace('pangea-re-survey-page-', '')
	const { projectId, decision, stepId, vendorId } = req.query
	const [ currentProject ] = await Projects.find({ "_id": projectId }).populate('industry')
	const template = generateTemplateForTasksAcceptOrRejectVendor(currentProject, stepId, decision, originalUrl)
	const stepWithVendor = currentProject.steps.find(item => item.stepId === stepId)
	const { vendor } = stepWithVendor
	if (!!vendor && vendorId.toString() === vendor.toString()) {
		res.send(template)
	} else {
		res.send(generateTemplateForDefaultMessage('The step was reassigned'))
	}

})

router.get('/step-decision', getProjectManageToken, async (req, res) => {
	const { decision, vendorId, projectId, stepId, to: mailDate } = req.query
	const [ currentProject ] = await Projects.find({ "_id": projectId }).populate('industry')
	const date = Date.now()
	const expiryInSeconds = Math.round((date - mailDate) / 1000)
	try {
		if (expiryInSeconds > 86000) {
			res.send(generateTemplateForDefaultMessage('Sorry! The link is already expired.'))
		} else {
			const project = await getProject({ "_id": projectId })
			let steps = [ ...project.steps ]
			let index = steps.findIndex(item => item.stepId === stepId)
			if (steps[index].vendorsClickedOffer.indexOf(vendorId) !== -1) {
				return res.send(generateTemplateForDefaultMessage('Sorry. You\'ve already made your decision.'))
			}
			emitter.emit('stepAcceptAction', { project, index, vendorId, decision })
			res.send(generateTemplateForAlertTasksAcceptOrRejectVendor(currentProject, stepId, decision))
		}
	} catch (err) {
		console.log(err)
		res.send(generateTemplateForDefaultMessage('Sorry. Acception failed! Try again later.'))
	}
})

module.exports = router
