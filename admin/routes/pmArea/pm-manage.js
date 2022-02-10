const router = require('express').Router()
const fs = require('fs')

const {
	User,
	Projects,
	Pricelist,
	Vendors,
	Discounts,
	ClientRequest,
	Clients
} = require('../../models')

const {
	assignVendorToStep
} = require('../../сalculations/updates')

const {
	getProject,
	createProject,
	createProjectFromMemoq,
	createProjectFromXTMFile,
	createTasks,
	createTasksForWordcount,
	updateProject,
	getProjectAfterCancelTasks,
	updateProjectStatus,
	setApprovedStepStatus,
	updateProjectProgress,
	storeFiles,
	notifyStepReopened,
	notifyVendorStepStart,
	updateOtherProject,
	getProjectAfterUpdate,
	checkProjectHasMemoqStep,
	assignProjectManagers,
	sendQuoteMessage,
	sendCostQuoteMessage,
	generateAndSaveCertificate,
	getFilteredProjects,
	createRequestTasks,
	updateRequestTasks,
	createProjectFromRequest,
	autoCreatingTaskInProject,
	saveCertificateTODR1Files,
	setStepDeadlineProjectAndMemoq,
	autoCreatingTranslationTaskInProject,
	cancelProjectInMemoq,
	updateWithApprovedTasks,
	autoCreatingTranslationTaskInProjectByMemoqLink,
	autoCreatingTranslationTaskInProjectByXTMFile,
	createProjectIndividual,
	reImportFilesFromMemoq,
	generateTargetFileFromMemoq
} = require('../../projects')

const {
	getQuoteMessage,
	getCostMessage
} = require('../../projects/emails')

const {
	upload,
	stepVendorsRequestSending,
	sendEmail,
	notifyClientProjectCancelled,
	notifyClientTasksCancelled,
	sendFlexibleEmail,
	sendQuoteToVendorsAfterProjectAccepted
} = require('../../utils')

const {
	reassignVendor,
	removeVendorFromStep
} = require('../../projectSteps')

const {
	getClientRequestById
} = require('../../clientRequests')

const {
	cancelMemoqDocs
} = require('../../services/memoqs/projects')


const {
	projectCancelledMessage,
	projectMiddleCancelledMessage,
	tasksMiddleCancelledMessage
} = require('../../emailMessages/clientCommunication')

const {
	updatePricelistDiscount,
	checkPricelistLangPairs,
	replenishPricelistLangs
} = require('../../pricelist')

const {
	pushNewLangs
} = require('../../multipliers')

const {
	setRejectedStatus
} = require('../../vendors/jobs')

const {
	getVendorsForSteps,
	getVendorStepDetails
} = require('../../vendors/getVendors')

const {
	setUpdatedFinanceData,
	calculateProjectTotal,
	recalculateStepFinance
} = require('../../сalculations/finance')

const { getEmailBackbone } = require("../../emailMessages/otherCommunication")

// XTRF ==>
const { createXtrfProjectWithFinance, updateFianceXTRF } = require("../../projects/xtrfApi")
const { createSendAllTasksToXtrf, updateTaskFianceXTRF } = require("../../projects/xtrfComplianceApi")

router.post('/build-TnS-from-memoq-link', async (req, res) => {
	const {
		memoqLink,
		projectId,
		memoqWorkFlow,
		creatorUserId,
		internalProjectId,
		startDate,
		deadline
	} = req.body

	try {
		const result = await autoCreatingTranslationTaskInProjectByMemoqLink({
			memoqLink,
			projectId,
			memoqWorkFlow,
			creatorUserId,
			internalProjectId,
			startDate,
			deadline
		})
		res.send(result)
	} catch (err) {
		console.log(err)
		res.status(500).send('/build-TnS-from-memoq-link')
	}
})


router.post('/build-TnS-from-xtm-file', upload.fields([ { name: 'file' } ]), async (req, res) => {
	const { projectId, internalProjectId, startDate, deadline } = req.body
	const { file } = req.files
	try {
		const result = await autoCreatingTranslationTaskInProjectByXTMFile({ projectId, internalProjectId, startDate, deadline, file: file[0] })
		fs.access(file[0].path, (error) => {
			if (!error) {
				fs.unlink(file[0].path, (err) => {
					if (err) return console.log(err)
				})
			}
		})
		res.send(result)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on adding tasks ref files')
	}
})

router.post('/send-email-from-to', async (req, res) => {
	const { message, to, from, subject } = req.body
	try {
		const html = getEmailBackbone(message)
		await sendFlexibleEmail({ from, to, subject }, html)
		res.send('Done!')
	} catch (err) {
		console.log(err)
		res.status(500).send('/send-email-from-to')
	}
})

router.post('/allprojects', async (req, res) => {
	const filters = { ...req.body }
	try {
		const projects = await getFilteredProjects(filters)
		res.send(projects)
	} catch (err) {
		console.log(err)
		res.status(500).send('Something wrong with DB while getting projects!')
	}
})

router.get('/project', async (req, res) => {
	const { id } = req.query
	try {
		const project = await getProject({ '_id': id })
		res.send(project)
	} catch (err) {
		console.log(err)
		console.log('Error on getting Project')
	}
})


router.post('/reimport-files-from-memoq', async (req, res) => {
	let { tasksIds, projectId } = req.body
	try {
		const updatedProject = await reImportFilesFromMemoq({ tasksIds, projectId })
		res.send(updatedProject)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on creating a project!')
	}
})

router.post('/generate-file-from-memoq', async (req, res) => {
	let { tasksIds, projectId } = req.body
	try {
		const link = await generateTargetFileFromMemoq({ tasksIds, projectId })
		res.send(link)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on creating a project!')
	}
})

router.post('/new-project', async (req, res) => {
	let { project, user } = req.body
	try {
		const result = await createProject(project, user)
		res.send(result)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on creating a project!')
	}
})

router.post('/new-project-individual', async (req, res) => {
	let { project, client, user } = req.body
	try {
		const result = await createProjectIndividual({ project, client, user })
		res.send(result)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on creating a project!')
	}
})

router.post('/new-project-from-memoq', async (req, res) => {
	let { project, memoqLink, selectedMemoqWorkflow, user } = req.body
	try {
		const result = await createProjectFromMemoq({ project, memoqLink, selectedMemoqWorkflow, user })
		res.send(result)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on creating a project!')
	}
})

router.post('/new-project-from-xtmFile', upload.fields([ { name: 'file' } ]), async (req, res) => {
	let { user, industry, project } = req.body
	const { file: files } = req.files
	try {
		user = JSON.parse(user)
		project = JSON.parse(project)
		const result = await createProjectFromXTMFile({ files, user, industry, project })
		for (const file of files) {
			fs.access(file.path, (error) => {
				if (!error) {
					fs.unlink(file.path, (err) => {
						if (err) return console.log(err)
					})
				}
			})
		}
		res.send(result)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on adding tasks ref files')
	}
})

router.post('/upload-reference-files', upload.fields([ { name: 'refFiles' } ]), async (req, res) => {
	try {
		const { refFiles } = req.files
		const { projectId, checkedTasks } = req.body
		let { _id, tasks } = await getProject({ '_id': projectId })
		const taskRefFiles = await storeFiles(refFiles, _id)

		for (let itemTasksId of JSON.parse(checkedTasks).map(({ taskId }) => taskId)) {
			const taskIndex = tasks.findIndex(({ taskId }) => taskId === itemTasksId)
			if (taskIndex !== -1) {
				if (tasks[taskIndex].hasOwnProperty('refFiles')) {
					tasks[taskIndex].refFiles.push(...taskRefFiles)
				} else {
					tasks[taskIndex].refFiles = []
					tasks[taskIndex].refFiles.push(...taskRefFiles)
				}
			}
		}

		const updatedProject = await updateProject({ '_id': _id }, { tasks })
		res.send(updatedProject)

	} catch (err) {
		console.log(err)
		res.status(500).send('Error on adding tasks ref files')
	}
})

router.post('/update-steps-dates', async (req, res) => {
	try {
		const { projectId, step, stepId, type, prop } = req.body
		if (step.hasOwnProperty('isCheck')) delete step.isCheck
		const updatedProject = await updateProject({ "_id": projectId, "steps._id": stepId }, { $set: { "steps.$": step } })

		if (prop === 'deadline' && type === 'CAT Wordcount' && !!step.vendor && step.status === 'In progress') {
			await setStepDeadlineProjectAndMemoq({ projectId, stepId: step.stepId })
		}
		res.send(updatedProject)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on update-step-deadline-by-index')
	}
})

router.post('/convert-request-into-project', async (req, res) => {
	try {
		const { projectId: requestId } = req.body
		const project = await createProjectFromRequest(requestId)
		try {
			await autoCreatingTaskInProject(project, requestId)
		} catch (err) {
			const { ObjectId } = require("mongoose/lib/types")
			await Projects.deleteOne({ "_id": ObjectId(project._id) })
			res.status(500).send('Error on converting tasks')
		}
		res.send(project._id)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on converting project')
	}
})

router.post('/convert-translation-request-into-project', async (req, res) => {
	try {
		const { projectId: requestId, creatorUserForMemoqId } = req.body
		const project = await createProjectFromRequest(requestId)
		try {
			await autoCreatingTranslationTaskInProject(project, requestId, creatorUserForMemoqId)
		} catch (err) {
			const { ObjectId } = require("mongoose/lib/types")
			await Projects.deleteOne({ "_id": ObjectId(project._id) })
			res.status(500).send('Error on converting tasks')
		}
		res.send(project._id)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on converting project')
	}
})

router.post('/request-tasks', upload.fields([ { name: 'sourceFiles' }, { name: 'refFiles' } ]), async (req, res) => {
	try {
		let tasksInfo = { ...req.body }
		const { sourceFiles, refFiles } = req.files
		const updatedProject = await createRequestTasks({ tasksInfo, sourceFiles, refFiles })
		res.send(updatedProject)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on adding project tasks')
	}
})

router.post('/remove-request-file', async (req, res) => {
	const { _id, taskId, category, path } = req.body
	try {
		if (category === 'Source') {
			await ClientRequest.updateOne({ "_id": _id, 'tasksAndSteps.taskId': taskId, "tasksAndSteps.sourceFiles.path": path },
					{ $pull: { "tasksAndSteps.$[i].sourceFiles": { path } } }, { arrayFilters: [ { 'i.taskId': taskId } ] })
		} else {
			await ClientRequest.updateOne({ "_id": _id, 'tasksAndSteps.taskId': taskId, "tasksAndSteps.refFiles.path": path },
					{ $pull: { "tasksAndSteps.$[i].refFiles": { path } } }, { arrayFilters: [ { 'i.taskId': taskId } ] })
		}
		fs.unlink(`./dist${ path }`, (err) => {
			if (err) throw(err)
		})
		const updatedProject = await getClientRequestById(_id)
		res.send(updatedProject)

	} catch (err) {
		console.log(err)
		res.status(500).send('Error on removing request file')
	}
})

router.post('/update-request-tasks', upload.fields([ { name: 'sourceFiles' }, { name: 'refFiles' } ]), async (req, res) => {
	try {
		let tasksInfo = { ...req.body }
		const { sourceFiles, refFiles } = req.files
		const updatedProject = await updateRequestTasks({ tasksInfo, sourceFiles, refFiles })
		res.send(updatedProject)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on adding project tasks')
	}
})

router.delete('/delete-request-tasks/:id/:projectId', async (req, res) => {
	const { id: taskId, projectId } = req.params
	try {
		await ClientRequest.updateOne({ "_id": projectId }, { $pull: { "tasksAndSteps": { "taskId": taskId } } })
		const updatedProject = await getClientRequestById(projectId)
		res.send(updatedProject)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on deleting task')
	}
})

router.post('/project-tasks', upload.fields([ { name: 'sourceFiles' }, { name: 'refFiles' } ]), async (req, res) => {
	try {
		let tasksInfo = req.body
		const { sourceFiles, refFiles } = req.files
		const updatedProject = await createTasks({ sourceFiles, refFiles, tasksInfo })
		res.send(updatedProject)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on adding project tasks')
	}
})

router.post('/project-words-tasks', async (req, res) => {
	const { tasksInfo, docs } = req.body
	try {
		const updatedProject = await createTasksForWordcount({ ...tasksInfo, docs })
		res.send(updatedProject)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on adding project\'s words tasks')
	}
})

router.post('/update-project', async (req, res) => {
	const project = { ...req.body }
	try {
		const savedProject = await updateProject({ '_id': project.id }, {
			steps: project.steps,
			tasks: project.tasks,
			isMetricsExist: project.isMetricsExist
		})
		res.send(savedProject)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on updating project')
	}
})

router.post('/update-progress', async (req, res) => {
	const { projectId, isCatTool } = req.body
	try {
		const project = await getProject({ '_id': projectId })
		const result = await updateProjectProgress(project, isCatTool)
		res.send(result)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on getting metrics')
	}
})

router.get('/all-managers', async (req, res) => {
	const { groupFilters } = req.query
	try {
		const users = await User.find({}, { firstName: 1, lastName: 1, group: 1 }).populate('group')
		const filteredUsers = groupFilters ? users.filter(item => groupFilters.split(',').indexOf(item.group.name) !== -1) : users
		res.send(filteredUsers)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on getting managers ')
	}
})

router.post('/mark-project-paid', async (req, res) => {
	const { projectId } = req.body
	try {
		const project = await getProject({ "_id": projectId })
		const steps = await sendQuoteToVendorsAfterProjectAccepted(project.steps, project)
		const updatedProject = await updateProject({ "_id": projectId }, { steps, isPaid: true, inPause: false })
		res.send(updatedProject)
	} catch (err) {
		console.log(err)
		res.status(500).send('Internal server error / Cannot mark Project "Is Paid"')
	}
})

router.put('/project-prop', async (req, res) => {
	const { projectId, prop, value } = req.body
	try {
		const result = await updateProject({ '_id': projectId }, { [prop]: value })
		res.send(result)
	} catch (err) {
		console.log(err)
		res.status(500).send('Internal server error / Cannot change Project\'s property')
	}
})

router.put('/send-manualy-to-xtrf', async (req, res) => {
	const { projectId, prop, value } = req.body
	try {
		const result = await updateProject({ '_id': projectId }, { [prop]: value, isXtrfManual: true })
		res.send(result)
	} catch (err) {
		console.log(err)
		res.status(500).send('Internal server error / Cannot change Project\'s property')
	}
})

router.put('/other-project-prop', async (req, res) => {
	const { projectId, prop, value } = req.body
	try {
		const result = await updateOtherProject({ '_id': projectId }, { [prop]: value })
		res.send(result)
	} catch (err) {
		console.log(err)
		res.status(500).send('Internal server error / Cannot change Project\'s property')
	}
})

router.put('/project-status', async (req, res) => {
	const { id, status, reason } = req.body
	try {
		const result = await updateProjectStatus(id, status, reason)
		res.send(result)
	} catch (err) {
		console.log(err)
		res.status(500).send('Internal server error / Cannot change Project\'s status')
	}
})

router.put('/sendCancelMessage-and-cancelProjectInMemoq', async (req, res) => {
	const { id, message, isNotify } = req.body
	try {
		const project = await getProject({ '_id': id })
		isNotify && await notifyClientProjectCancelled(project, message)
		await cancelProjectInMemoq(project)
		res.send(project)
	} catch (err) {
		console.log(err)
		res.status(500).send('Internal server error / Cannot change Project\'s status')
	}
})

router.put('/project-date', async (req, res) => {
	const { projectId, date } = req.body
	try {
		const result = await updateProject({ '_id': projectId }, date)
		res.send(result)
	} catch (err) {
		console.log(err)
		res.status(500).send('Internal server error / Cannot change Project\'s deadline')
	}
})

router.get('/quote-message', async (req, res) => {
	const { projectId } = req.query
	try {
		const message = await getQuoteMessage(projectId, [])
		res.send({ message })
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on getting quote message')
	}
})

router.get('/quote-cost-message', async (req, res) => {
	const { projectId } = req.query
	try {
		const message = await getCostMessage(projectId, 'quote')
		res.send({ message })
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on getting quote message')
	}
})

router.post('/task-quote-message', async (req, res) => {
	const { projectId, tasksIds } = req.body
	try {
		const message = await getQuoteMessage(projectId, tasksIds)
		res.send({ message })
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on getting task quote message')
	}
})
router.post('/send-cost-quote', async (req, res) => {
	const { id, message, arrayOfEmails } = req.body
	try {
		const project = await getProjectAfterUpdate({ _id: id }, { status: 'Cost Quote' })
		await sendCostQuoteMessage(project, message, arrayOfEmails)
		res.send(project)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on sending the Quote')
	}
})
router.post('/send-quote', async (req, res) => {
	const { id, message, arrayOfEmails } = req.body
	try {
		const project = await getProject({ _id: id })
		const projectTasks = project.tasks.map((task) => {
			if (task.status === 'Created' || task.status === 'Rejected') task.status = 'Quote sent'
			return task
		})
		await sendQuoteMessage(project, message, arrayOfEmails)
		const updatedProject = await getProjectAfterUpdate({ _id: id }, {
			status: 'Quote sent',
			isClientOfferClicked: false,
			tasks: projectTasks
		})
		res.send(updatedProject)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on sending the Quote')
	}
})

router.post('/send-task-quote', async (req, res) => {
	const { projectId, message, arrayOfEmails, tasksIds } = req.body
	try {
		const project = await getProject({ '_id': projectId })
		let { tasks } = project
		tasks = tasks.map(task => {
			if (tasksIds.includes(task.taskId)) task.status = 'Quote sent'
			return task
		})
		await sendQuoteMessage(project, message, arrayOfEmails, tasksIds)
		const updatedProject = await updateProject({ '_id': projectId }, { tasks })
		res.send(updatedProject)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on sending the Quote')
	}
})

router.post('/vendor-request', async (req, res) => {
	const { projectId, checkedSteps } = req.body
	try {
		const project = await getProject({ '_id': projectId })
		const updatedSteps = await stepVendorsRequestSending(project, checkedSteps)
		const updatedProject = await updateProject({ '_id': project.id }, { steps: updatedSteps })
		res.send(updatedProject)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on sending the Request Confirmation')
	}
})

router.post('/reassign-vendor', async (req, res) => {
	const { projectId, stepId, progress, isStart, isPay, reason, vendor } = req.body

	try {
		const updatedProject = await reassignVendor({ projectId, stepId, progress, isStart, isPay, reason, vendor })
		res.send(updatedProject)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on reassignments vendors')
	}
})

router.post('/vendor-assigment', async (req, res) => {
	let { projectId, stepsVendors } = req.body
	try {
		const updatedProject = await assignVendorToStep({ projectId, stepsVendors })
		res.send(updatedProject)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on getting step payables')
	}
})

router.post('/approve-tasks', async (req, res) => {
	const { tasks: taskIds, projectId } = req.body
	try {
		const project = await getProject({ "_id": projectId })
		const { tasks, steps } = updateWithApprovedTasks({ taskIds, project })
		const updatedProject = await updateProject({ "_id": projectId }, { $set: { tasks, steps } })
		res.send(updatedProject)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on cancelling tasks / cancel-tasks')
	}
})

router.post('/cancel-tasks', async (req, res) => {
	const { tasks, projectId } = req.body
	try {
		const project = await getProject({ '_id': projectId })
		const updatedProject = await getProjectAfterCancelTasks(tasks, project)
		const wordsCancelledTasks = tasks.filter(item => item.memoqDocs.length)
		if (wordsCancelledTasks.length) {
			await cancelMemoqDocs(wordsCancelledTasks)
		}
		res.send(updatedProject)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on cancelling tasks / cancel-tasks')
	}
})
router.post('/delete-tasks', async (req, res) => {
	const { tasks, projectId } = req.body
	try {

		// const allProjects = await Projects.findOne(_id: projectId)
		await Projects.updateOne(
				{ _id: projectId },
				{ $pull: { 'tasks': { "taskId": { $in: tasks }, status: 'Cancelled' }, 'steps': { "taskId": { $in: tasks }, status: 'Cancelled' } } },
				{ new: true }
		)

		const updatedProject = await getProject({ '_id': projectId })
		res.send(updatedProject)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on cancelling tasks / cancel-tasks')
	}
})

router.post('/send-task-cancel-message', async (req, res) => {
	const { id, message } = req.body
	try {
		const project = await getProject({ '_id': id })
		await notifyClientTasksCancelled(project, message)
		res.send('Message sent')
	} catch (err) {
		console.log(err)
		res.status(500).send('Internal server error / Cannot change Project\'s status')
	}
})

router.post('/step-status', async (req, res) => {
	const { id, status, steps } = req.body
	let project = await getProject({ '_id': id })
	let allSteps = project.steps
	try {
		if (status === 'Approved') {
			for await (const step of steps) {
				allSteps = setApprovedStepStatus({ project, step: step, steps: allSteps })
				await notifyVendorStepStart(steps, allSteps, project)
			}
			project = await updateProject({ '_id': id }, { steps: allSteps })
		}

		if (status === 'Rejected') {
			for await (const step of steps) {
				allSteps = setRejectedStatus({ steps: allSteps, jobId: step._id })
			}
			project = await updateProject({ '_id': id }, { steps: allSteps })
		}

		res.send(project)
	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})

router.post('/steps-reopen', async (req, res) => {
	const { steps } = req.body
	try {
		const project = await getProject({ 'steps._id': steps[0]._id })
		//SOOn
		// const updateProject = await getAfterReopenSteps(steps, project)
		await notifyStepReopened(steps, project.projectId)
		res.send(updateProject)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on reopening steps')
	}
})

router.post('/close-project', async (req, res) => {
	const { projectId } = req.body
	try {
		const project = await getProject({ _id: projectId })
		let { tasks, steps } = project
		tasks = tasks.map(i => {
			const statuses = [ 'Approved', 'In progress', 'Pending Approval [DR1]' ]
			if (statuses.indexOf(i.status) !== -1) i.status = 'Completed'
			return i
		})
		steps = steps.map(i => {
			const statuses = [ 'Approved', 'Ready to Start', 'Waiting to Start', 'In progress' ]
			if (statuses.indexOf(i.status) !== -1) i.status = 'Completed'
			return i
		})
		const updatedProject = await getProjectAfterUpdate({ _id: projectId }, { tasks, steps, status: 'Closed' })
		res.send(updatedProject)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on close project')
	}
})

router.post('/generate-certificate', async (req, res) => {
	const { project, type, tasks, deliveryData } = req.body
	try {
		await generateAndSaveCertificate({ project, tasks, deliveryData })
		const updatedProject = await saveCertificateTODR1Files(project, type, deliveryData)
		res.send(updatedProject)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on generate certificate')
	}
})

router.post('/delete-project', async (req, res) => {
	const { projectId } = req.body
	try {
		await Projects.remove({ _id: projectId })
		res.send('')
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on removing request file')
	}
})

router.post('/project-value', async (req, res) => {
	const { id, prop, value } = req.body
	try {
		if (prop === 'projectManager') {
			const memoqSteps = await checkProjectHasMemoqStep(id)
			if (memoqSteps.length) {
				for (let memoqProjectId of memoqSteps) {
					await assignProjectManagers({ manager: value._id, memoqProjectId })
				}
			}
		}
		const updatedProject = await updateProject({ '_id': id }, { [prop]: value })
		res.send(updatedProject)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on saving project property value')
	}
})

function getAccManagerAndContact(project) {
	const accManager = project.accountManager
	const contact = project.customer.contacts.find(item => item.leadContact)
	return { accManager, contact }
}

router.post('/making-cancel-message', async (req, res) => {
	const { cancelStatus } = req.body
	const { accManager, contact } = getAccManagerAndContact(req.body)
	try {
		const message = cancelStatus === 'Cancelled Halfway' ?
				projectMiddleCancelledMessage({ ...req.body, accManager, contact })
				: projectCancelledMessage({ ...req.body, accManager, contact })
		res.send({ message })
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on making project cancelled message')
	}
})

router.post('/making-tasks-cancel-message', async (req, res) => {
	const { project, tasks, reason, isPay } = req.body
	const { accManager, contact } = getAccManagerAndContact(project)
	try {
		const message = tasksMiddleCancelledMessage({ project, tasks, accManager, contact, reason, isPay })
		res.send({ message })
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on making tasks cancelled message')
	}
})

router.post('/urgent', async (req, res) => {
	const { projectId, isUrgent } = req.body
	try {
		let { projectName } = await getProject({ _id: projectId })
		if (isUrgent) projectName = '[Urgent] ' + projectName
		else projectName = projectName = projectName.replace('[Urgent] ', '')
		const project = await getProjectAfterUpdate({ _id: projectId }, { projectName, isUrgent })
		res.send(project)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on updating project urgent')
	}
})

router.post('/client-contact', async (req, res) => {
	const { projectId, contact, oldContact: { _id: oldContact } } = req.body
	try {
		let { clientContacts } = await Projects.findOne({ _id: projectId })
		if (oldContact) {
			const oldIdxContact = clientContacts.findIndex(item => item._id.toString() === oldContact.toString())
			clientContacts.splice(oldIdxContact, 1, contact)
		} else {
			clientContacts.push(contact)
		}
		const project = await getProjectAfterUpdate({ _id: projectId }, { clientContacts })
		res.send(project)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on updating/creating client contact')
	}
})

router.delete('/client-contact/:projectId/:contactId', async (req, res) => {
	const { projectId, contactId } = req.params
	try {
		const { clientContacts } = await Projects.findOne({ _id: projectId })
		const contactToDeleteIndex = clientContacts.findIndex(item => item._id.toString() === contactId.toString())
		clientContacts.splice(contactToDeleteIndex, 1)
		const project = await getProjectAfterUpdate({ _id: projectId }, { clientContacts })
		res.send(project)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on deleting client contact')
	}
})

router.post('/contact-email', async (req, res) => {
	const { projectId, contactId, template } = req.body
	try {
		const { clientContacts } = await Projects.findOne({ _id: projectId })
		const { email } = clientContacts.find(contact => contact._id.toString() === contactId.toString())
		const subject = 'Pangea translation services'
		await sendEmail({ to: email, subject }, template, true)
		res.send(true)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on sending message to client\'s contact')
	}
})

router.post('/update-discount/:id', async (req, res) => {
	const { id } = req.params
	const { updatedRowObj } = req.body
	try {
		const { discountChart } = await updatePricelistDiscount(id, updatedRowObj)
		res.send(discountChart)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on updating pricelist\'s discount table')
	}
})

router.post('/check-pricelist-langs', async (req, res) => {
	const { pricelistId, langPairs } = req.body
	try {
		const newLangPairs = await checkPricelistLangPairs(pricelistId, langPairs)
		if (newLangPairs.length) {
			await replenishPricelistLangs(pricelistId, newLangPairs)
			res.send('Replenished!')
		} else {
			res.send('Doesn\'t need to update!')
		}
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on checking pricelist languages!')
	}
})

router.get('/pricelist-new-langs/:id', async (req, res) => {
	const { id } = req.params
	try {
		const { newLangPairs } = await Pricelist.findOne({ _id: id })
				.populate('newLangPairs.source', [ 'lang' ])
				.populate('newLangPairs.target', [ 'lang' ])

		res.send(newLangPairs)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on getting pricelist\'s new languages!')
	}
})

router.post('/add-new-langs', async (req, res) => {
	const { pricelistId, langArr } = req.body
	try {
		await pushNewLangs(pricelistId, langArr)
		const updatedPricelist = await Pricelist.findOne({ _id: pricelistId })
				.populate('newLangPairs.source', [ 'lang' ])
				.populate('newLangPairs.target', [ 'lang' ])
		res.send(updatedPricelist.newLangPairs)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on adding new languages')
	}
})

router.get('/discounts', async (req, res) => {
	try {
		const discounts = await Discounts.find()
		res.send(discounts)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on getting discounts')
	}
})

router.post('/create-discount', async (req, res) => {
	const { newDiscountObj } = req.body
	try {
		await Discounts.create(newDiscountObj)
		const discounts = await Discounts.find()
		res.send(discounts)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on creating new discount')
	}
})

router.post('/update-discounts', async (req, res) => {
	const { _id, values } = req.body
	try {
		await Discounts.updateOne({ _id }, { ...values })
		const updatedDiscounts = await Discounts.find()
		res.send(updatedDiscounts)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on updating discounts')
	}
})

router.post('/delete-discount', async (req, res) => {
	const { _id } = req.body
	try {
		await Discounts.deleteOne({ _id })
		const discounts = await Discounts.find()
		res.send(discounts)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on deleting discount')
	}
})

router.get('/get-project-discounts', async (req, res) => {
	const { id } = req.query
	try {
		const discounts = await Projects.findOne({ "_id": id }, { discounts: 1 })
		res.send(discounts)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on getting project discounts')
	}
})

router.post('/update-project-discounts', async (req, res) => {
	const { _id, updatedArray } = req.body
	try {
		await Projects.updateOne({ _id }, { discounts: updatedArray })
		await recalculateStepFinance(_id)
		const updatedProject = await calculateProjectTotal(_id)
		res.send(updatedProject)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on updating project\'s discounts')
	}
})

router.post('/update-project-additions', async (req, res) => {
	const { _id, additionsSteps } = req.body
	try {
		const updatedProject = await updateProject({ _id }, { additionsSteps })
		res.send(updatedProject)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on updating project\'s discounts')
	}
})

router.post('/update-minimum-charge', async (req, res) => {
	const { _id, value, toIgnore } = req.body
	try {
		await Projects.updateOne({ _id }, { minimumCharge: { value: +value, toIgnore } })
		await recalculateStepFinance(_id)
		const updatedProject = await calculateProjectTotal(_id)
		res.send(updatedProject)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on updating project\'s minimum charge!')
	}
})

router.post('/remove-vendor-from-step', async (req, res) => {
	const { stepId, projectId } = req.body
	try {
		await removeVendorFromStep({ stepId, projectId })
		const updatedProject = await calculateProjectTotal(projectId)
		res.send(updatedProject)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on remove-vendor-from-step!')
	}
})

router.get('/vendors-for-steps', async (req, res) => {
	try {
		const result = await getVendorsForSteps()
		res.send(result)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on vendor-for-steps!')
	}
})
router.post('/vendors-for-steps-details', async (req, res) => {
	const { vendorId, stepInfo } = req.body
	try {
		const result = await getVendorStepDetails(vendorId, stepInfo)
		res.send(result)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on vendor-for-steps!')
	}
})
router.post('/step-vendor-brief', async (req, res) => {
	const { projectId, stepId, vendorBrief } = req.body
	try {
		await Projects.updateOne({ _id: projectId, "steps._id": stepId }, { $set: { "steps.$.vendorBrief": vendorBrief } })

		const updatedProject = await getProject({ _id: projectId })
		res.send(updatedProject)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on vendor-for-steps!')
	}
})

router.get('/vendors-for-options', async (req, res) => {
	try {
		const result = await Vendors.find({ status: "Active" }, { "firstName": 1, "surname": 1 })
		res.send(result)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on vendors-for-project!')
	}
})

router.get('/clients-for-options', async (req, res) => {
	try {
		const result = await Clients.find({ status: "Active" }, { "name": 1 })
		res.send(result)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on clients-for-options!')
	}
})

router.post('/update-filters-and-fields/:userId', async (req, res) => {
	const { userId } = req.params
	const { data } = req.body
	try {
		await User.updateOne({ _id: userId }, { $set: { layoutsSettings: { project: data } } })
		res.send("done!")
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on update project filters')
	}
})

router.post('/step-finance-edit/:projectId', async (req, res) => {
	const { projectId } = req.params
	const data = req.body
	try {
		const updatedProject = await setUpdatedFinanceData({ projectId, ...data })
		res.send(updatedProject)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on update project filters')
	}
})


//XTRF ==>>

router.get('/createXtrfProjectWithFinance/:projectId', async (req, res) => {
	const { projectId } = req.params
	res.send(await createXtrfProjectWithFinance(projectId))
})

router.get('/updateXtrfProject/:projectId', async (req, res) => {
	const { projectId } = req.params
	await updateFianceXTRF(projectId)
	res.send('Done!')
})

router.post('/createXtrfTasksWithFinance/:projectId', async (req, res) => {
	const { projectId } = req.params
	await createSendAllTasksToXtrf(projectId)
	res.send('test')
})

router.post('/updateXtrfTasks/:projectId', async (req, res) => {
	const { projectId } = req.params
	const { xtrfId, taskId } = req.body
	await updateTaskFianceXTRF(projectId, xtrfId, taskId)
	res.send('Done!')
})

// XTRF API ==================================================================


module.exports = router
