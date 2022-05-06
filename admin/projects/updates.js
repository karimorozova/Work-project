const {
	Projects,
	User,
	Units,
	Vendors
} = require('../models')

const _ = require('lodash')
const parser = require('xml2json')
const fs = require("fs")
const Response = require('../helpers/Response')
const xl = require('excel4node')

const { getProject, updateProject, getProjectAfterUpdate } = require('./getProjects')

const {
	stepCancelNotifyVendor,
	notifyVendorStepStart
} = require('./emails')

const {
	getProjectTranslationDocs,
	getProjectUsers,
	setMemoqProjectUsers,
	assignMemoqTranslators,
	setMemoqDocsDeadline,
	setCancelledNameInMemoq,
	cancelMemoqDocs
} = require('../services/memoqs/projects')

const {
	downloadMemoqFile,
	downloadMemoqFileXML
} = require('../services/memoqs/files')

const { getMemoqUsers, createMemoqUser } = require('../services/memoqs/users')
const { notifyManagerProjectStarts, managerNotifyMail, sendQuoteToVendorsAfterProjectAccepted } = require('../utils')
const { calculateProjectTotal, recalculateStepFinance } = require("../сalculations/finance")
const { createInvoicePipeline } = require("../invoicing/createInvoicing")


const manageReceivableVisible = async (bool, _stepId) => {
	let quantity = 0
	if (bool) {
		const { steps } = await Projects.findOne({ "steps._id": _stepId })
		const _idx = steps.findIndex(({ _id }) => _id.toString() === _stepId.toString())
		quantity = steps[_idx].nativeFinance.Wordcount.receivables || steps[_idx].nativeFinance.Quantity.receivables
	}
	const project = await Projects.findOneAndUpdate(
			{ "steps._id": _stepId },
			{
				$set: {
					"steps.$[i].isReceivableVisible": bool,
					"steps.$[i].finance.Quantity.receivables": quantity,
					"steps.$[i].finance.Wordcount.receivables": quantity
				}
			},
			{ arrayFilters: [ { 'i._id': _stepId } ] }
	)

	await recalculateStepFinance(project.id)
	return await calculateProjectTotal(project.id)
}

const cancelProjectInMemoq = async (project) => {
	if (project.status !== 'Cancelled') return

	const wordsTasks = project.tasks.filter(item => item.service.title === 'Translation' && item.memoqDocs.length)
	if (wordsTasks.length) {
		await cancelMemoqDocs(wordsTasks)
		await setCancelledNameInMemoq(wordsTasks, `${ project.projectId } - ${ project.projectName }`)
	}
}

async function updateProjectProgress(project, isCatTool) {
	let { steps, tasks } = project
	try {
		for (let task of tasks) {
			if (task.memoqDocs.length && isCatTool) {
				const docs = await getProjectTranslationDocs(task.memoqProjectId)
				task.memoqDocs = Array.isArray(docs) ? docs.filter(item => item.TargetLangCode === task.memoqTarget) : [ docs ]
				steps = updateWordcountStepsProgress({ steps, task })
			} else if (!isCatTool) {
				steps = updateStepsProgress(task, steps)
			}
		}
		return await updateProject({ "_id": project.id }, { steps, tasks })
	} catch (err) {
		console.log(err)
		console.log("Error in updateProjectProgress")
	}
}

async function getProjectAfterCancelTasks(tasks, project) {
	try {
		const { changedTasks, changedSteps, stepIdentify } = await cancelTasks(tasks, project)

		const notifySteps = stepIdentify.length
				? changedSteps.filter(item => stepIdentify.indexOf(item.stepId) !== -1)
				: changedSteps

		await stepCancelNotifyVendor(notifySteps)

		await updateProject({ "_id": project.id }, { tasks: changedTasks, steps: changedSteps })
		await recalculateStepFinance(project.id)
		return await calculateProjectTotal(project.id)
	} catch (err) {
		console.log(err)
		console.log("Error in getProjectAfterCancelTasks")
		throw new Error(err.message)
	}
}

async function cancelTasks(tasks, project) {
	let projectTasks = [ ...project.tasks ]
	let projectSteps = [ ...project.steps ]
	const tasksIds = tasks.map(item => item.taskId)
	let inCompletedSteps = []
	if (projectSteps.length) {
		inCompletedSteps = projectSteps.map(item => {
			if (item.status !== "Completed" && item.status !== 'Cancelled' && item.status !== 'Cancelled Halfway' && tasksIds.indexOf(item.taskId) !== -1) return { ...item._doc }
		}).filter(item => !!item)
	}
	const stepIdentify = inCompletedSteps.length
			? inCompletedSteps.map(step => step.stepId)
			: []

	const changedSteps = stepIdentify.length
			? cancelSteps({ stepIdentify, steps: projectSteps })
			: []
	try {
		const changedTasks = await cancelCheckedTasks({ tasksIds, projectTasks, changedSteps })
		return {
			changedTasks,
			changedSteps,
			stepIdentify
		}
	} catch (err) {
		console.log(err)
		console.log("Error in cancelTasks")
		throw new Error(err.message)
	}
}

function cancelSteps({ stepIdentify, steps }) {
	return steps.map(item => {
		if (stepIdentify.indexOf(item.stepId) !== -1) {
			let newStatus = item.status !== 'Completed' ? "Cancelled" : item.status

			if (+item.progress.wordsDone > 0 && newStatus !== 'Completed') {
				newStatus = "Cancelled Halfway"
				let { finance, nativeFinance } = getStepNewFinanceHalfway(item)
				return { ...item._doc, previousStatus: item.status, status: newStatus, finance, nativeFinance }
			} else {
				item.finance = item.nativeFinance = {
					Quantity: { receivables: 0, payables: 0 },
					Wordcount: { receivables: 0, payables: 0 },
					Price: { receivables: 0, payables: 0 }
				}
			}
			item.previousStatus = item.status
			item.status = newStatus
		}
		return item
	})
}

async function cancelCheckedTasks({ tasksIds, projectTasks, changedSteps }) {
	const unchangingStatuses = [ 'Pending Approval [DR1]', 'Completed' ]
	let tasks = [ ...projectTasks ]
	try {
		for (let task of tasks) {
			if (tasksIds.indexOf(task.taskId) !== -1 && unchangingStatuses.indexOf(task.status) === -1) {
				task.previousStatus = task.status
				task.status = getTaskStatusAfterCancel(changedSteps, task.taskId) || task.status
			}
		}
		return tasks
	} catch (err) {
		console.log(err)
		console.log("Error in cancelCheckedTasks")
		throw new Error(err.message)
	}
}

function getTaskStatusAfterCancel(steps, taskId) {
	const taskSteps = steps.filter(item => item.taskId === taskId).map(step => step.status)

	return taskSteps.map(i => i.status).includes('Cancelled Halfway')
			? 'Cancelled Halfway'
			: 'Cancelled'
}

function getStepNewFinanceHalfway(step) {
	let { progress, finance, nativeFinance } = step
	progress = (progress.wordsDone / progress.totalWordCount) * 100

	return {
		finance: mutatedFinanceByPercent(finance, progress),
		nativeFinance: mutatedFinanceByPercent(nativeFinance, progress)
	}

	function mutatedFinanceByPercent(finance, progress) {
		for (const quantity_wordcount_price in finance) if (Object.hasOwnProperty.call(finance, quantity_wordcount_price)) {
			for (const receivables_payables in finance[quantity_wordcount_price]) if (Object.hasOwnProperty.call(finance[quantity_wordcount_price], receivables_payables)) {
				finance[quantity_wordcount_price][receivables_payables] = +((finance[quantity_wordcount_price][receivables_payables] * progress) / 100).toFixed(2)
			}
		}
		return finance
	}
}

const generateTargetFileFromMemoq = async ({ tasksIds, projectId }) => {
	const { tasks } = await getProject({ _id: projectId })
	const translations = []

	for await (const id of tasksIds) {
		const { memoqProjectId, memoqDocs, sourceLanguage, targetLanguage } = tasks.find(({ _id }) => `${ _id }` === `${ id }`)

		if (!memoqDocs.length) return new Response(Response.Error, 'No such documents on current task!')

		for await (const doc of memoqDocs) {
			const { DocumentGuid } = doc
			const path = `/projectFiles/${ projectId }/${ targetLanguage }-${ Math.floor(Math.random() * 1000000) }-${ DocumentGuid }-target.xml`
			await downloadMemoqFileXML({ memoqProjectId, DocumentGuid, path: `./dist${ path }` })

			await new Promise((resolve) => {
				fs.readFile(`./dist${ path }`, (err, data) => {
					if (err) return new Response(Response.Error, 'Cannot read data from saved file!')
					const fileContent = data.toString()
					let result
					try {
						result = parser.toJson(fileContent, { object: true, sanitize: true, trim: true })
					} catch (e) {
						return new Response(Response.Error, 'Cannot parse xml file!')
					}
					let { xliff: { file: { body: { "trans-unit": translation } } } } = result
					translation = translation
							.map(item => ({ sourceText: item.source['$t'], targetText: item.target['$t'] }))
							.filter(item => item.sourceText)
							.reduce((acc, curr) => {
								return {
									sourceText: acc.sourceText + curr.sourceText + ' ',
									targetText: acc.targetText + curr.targetText || '' + ' ',
									sourceLanguage,
									targetLanguage
								}
							}, { sourceText: '', targetText: '' })
					translations.push(translation)
					fs.stat(`./dist${ path }`, (err) => {
						if (err) return console.error(err)
						fs.unlink(`./dist${ path }`, (err) => {
							if (err) return console.log(err)
						})
					})
					resolve()
				})
			})
		}
	}
	const groupedTranslation = _.groupBy(translations, "sourceText")

	const wb = new xl.Workbook()
	let i = 1
	for await (let [ sourceText, obj ] of Object.entries(groupedTranslation)) {
		const temp = wb.addWorksheet('Sheet ' + i)
		temp.cell(1, 1).string(obj[0].sourceLanguage)
		temp.cell(2, 1).string(sourceText)
		let col = 2
		for (const elem of obj) {
			temp.cell(1, col).string(elem.targetLanguage)
			temp.cell(2, col).string(elem.targetText)
			col++
		}
		i++
	}
	const targetPath = `/projectFiles/${ projectId }/${ Math.floor(Math.random() * 1000000) }-Target.xlsx`
	await new Promise((resolve) => {
		wb.write(`./dist${ targetPath }`)
		resolve()
	})

	return new Response(Response.Success, targetPath)
}

const reImportFilesFromMemoq = async ({ tasksIds, projectId }) => {
	const { tasks, tasksDR1 } = await getProject({ _id: projectId })

	for await (const id of tasksIds) {
		const targetFiles = []
		const _taskIdx = tasks.findIndex(({ _id }) => `${ _id }` === `${ id }`)
		const _taskDR1Idx = tasksDR1.findIndex(({ taskId }) => taskId === tasks[_taskIdx].taskId)
		let { memoqDocs, memoqProjectId, targetLanguage } = tasks[_taskIdx]

		for await (const doc of memoqDocs) {
			const { DocumentName, DocumentGuid } = doc
			let fileName = `${ targetLanguage }-${ Math.floor(Math.random() * 1000000) }-${ DocumentName }`
			const path = `/projectFiles/${ projectId }/${ fileName }`
			await downloadMemoqFile({ memoqProjectId, docId: DocumentGuid, path: `./dist${ path }` })
			targetFiles.push({ fileName, path })
		}

		tasks[_taskIdx].targetFiles = tasks[_taskIdx].targetFilesFinalStage = targetFiles
		tasksDR1[_taskDR1Idx].files = targetFiles.map(item => {
			return {
				...item,
				isFileApproved: false,
				isFilePushedDR2: false
			}
		})
	}

	return await getProjectAfterUpdate({ _id: projectId }, { tasks, tasksDR1 })
}

async function getTaskTargetFiles({ task, projectId, step }) {
	let { memoqDocs, memoqProjectId, targetLanguage, targetFilesStages } = task
	let { _id, stepNumber } = step
	let targetFiles = []

	try {
		for (let doc of memoqDocs) {
			let fileName = `${ targetLanguage }-${ stepNumber }-${ Math.floor(Math.random() * 1000000) }-${ doc.DocumentName }`
			const path = `/projectFiles/${ projectId }/${ fileName }`
			await downloadMemoqFile({ memoqProjectId, docId: doc.DocumentGuid, path: `./dist${ path }` })
			targetFiles.push({ fileName, path })
		}
		const _idxStage = targetFilesStages.findIndex(item => item.stepId === _id)

		if (_idxStage === -1) {
			targetFilesStages.push({ stepId: _id, files: targetFiles })
		} else {
			targetFilesStages[_idxStage].files = targetFiles
		}

		return {
			...task._doc,
			targetFiles,
			targetFilesStages
		}

	} catch (err) {
		// TODO: temp. is error on memoq with downloading target file!
		return {
			...task._doc,
			targetFiles,
			targetFilesStages
		}
		// console.log(err)
		// console.log("Error in getTaskTargetFiles")
		// throw new Error(err.message)
	}
}

async function downloadCompletedFiles(stepId) {
	try {
		let { _id, steps, tasks } = await getProject({ "steps._id": stepId })
		const step = steps.find(item => item._id.toString() === stepId.toString())
		const _taskIndex = tasks.findIndex(item => item.taskId === step.taskId)

		tasks[_taskIndex] = await getTaskTargetFiles({
			task: tasks[_taskIndex],
			projectId: _id,
			step
		})

		await Projects.updateOne({ _id }, { tasks })
	} catch (err) {
		console.log(err)
		console.log("Error in downloadCompletedFiles")
		throw new Error(err.message)
	}
}

async function reOpenProject(project, ifChangePreviousStatus = true) {
	let { steps, tasks } = project

	if (ifChangePreviousStatus) {
		steps = reopenItem(steps)
		tasks = reopenItem(tasks)
	}

	return await updateProject(
			{ '_id': project._id },
			{ status: 'In progress', tasks, steps }
	)

	function reopenItem(arr) {
		return arr.map(item => {
			if (item.status === "Cancelled" || item.status === "Cancelled Halfway") {
				// item.status = item.previousStatus
			}
			return item
		})
	}
}

async function updateProjectStatus(id, status, reason) {
	try {
		const project = await getProject({ "_id": id })
		// if (status === 'fromCancelled') return await reOpenProject(project)
		// if (status === 'fromClosed') return await reOpenProject(project, false)
		if (status === "Cancelled") {
			const { tasks, steps } = project
			const { changedTasks, changedSteps } = await cancelTasks(tasks, project)
			if (steps.length) await stepCancelNotifyVendor(steps)
			await updateProject({ "_id": id }, {
				status: changedSteps.some(i => i.status === 'Cancelled Halfway') ? 'Cancelled Halfway' : status,
				reason,
				isPriceUpdated: false,
				tasks: changedTasks,
				steps: changedSteps
			})
			await recalculateStepFinance(id)
			return await calculateProjectTotal(id)
		} else {
			return await setNewProjectDetails(project, status, reason)
		}
	} catch (err) {
		console.log(err)
		console.log("Error in updateProjectStatus")
		throw new Error(err.message)
	}
}

const setApprovedStepStatus = ({ project, step, steps }) => {
	const { status } = project
	const isProjectApprovedStatus = status === 'Approved' || status === 'In progress'
	const brotherlySteps = steps.filter(item => item.taskId === step.taskId)

	return steps.map(item => {
		if (item._id.toString() === step._id.toString()) {
			if (brotherlySteps.length > 1) {
				const { stepNumber } = step
				const prevStep = brotherlySteps.find(item => item.stepNumber === stepNumber - 1 && item.status !== 'Cancelled Halfway' && item.status !== 'Cancelled')
				if (prevStep && isProjectApprovedStatus) {
					item.status = prevStep.status === 'Completed' ? 'Ready to Start' : 'Waiting to Start'
					return item
				}
				item.status = isProjectApprovedStatus ? 'Ready to Start' : 'Approved'
				return item
			}
			item.status = isProjectApprovedStatus ? 'Ready to Start' : 'Approved'
			return item
		}
		return item
	})
}

async function setNewProjectDetails(project, status, reason) {
	try {
		if (status === "Approved") {
			return await getApprovedProject(project)
		}
		if (status === "Rejected") {
			const client = { ...project.customer._doc, id: project.customer.id }
			const user = await User.findOne({ "_id": client.projectManager._id })
			await managerNotifyMail(
					user,
					`<li>Dear ${ user.firstName }</li>` + `<p>The Quote with ID ${ project.projectId } was rejected ` + `by the client ${ client.name }</p>`,
					`Quote Details ${ project.projectId }`
			)
		}
		return await updateProject({ "_id": project.id }, { status, isPriceUpdated: false, reason: reason })
	} catch (err) {
		console.log(err)
		console.log("Error in setNewProjectDetails")
		throw new Error(err.message)
	}
}

async function getApprovedProject(project) {
	const taskIds = project.tasks.map(item => item.taskId)
	const { tasks, steps } = updateWithApprovedTasks({ taskIds, project })
	project.isStartAccepted = true
	try {
		if (project.isStartAccepted) {
			await notifyManagerProjectStarts(project, false)
		}
		if (!project.inPause) {
			await notifyVendorStepStart(steps, steps, project)
		}

		const currentContacts = project.customer.contacts.filter(({_id}) => project.clientBillingInfo.contacts.includes(_id))
		await createInvoicePipeline(project._id,  currentContacts.map((({ email }) => email)))

		let updatedProject = await updateProject({ "_id": project.id }, { status: 'Approved', isStartAccepted: true, tasks, steps, isPriceUpdated: false })

		if (!project.inPause) {
			let updatedSteps = await sendQuoteToVendorsAfterProjectAccepted(updatedProject.steps, updatedProject)
			updatedProject = await updateProject({ "_id": project.id }, { steps: updatedSteps })
		}
		return updatedProject
	} catch (err) {
		console.log(err)
		console.log("Error in getApprovedProject")
		throw new Error(err.message || err)
	}
}


function updateWithApprovedTasks({ taskIds, project }) {
	const tasks = project.tasks.map(task => {
		if ((task.status === 'Created' || task.status === 'Quote sent') && taskIds.indexOf(task.taskId) !== -1) task.status = 'Approved'
		return task
	})

	let steps = project.steps
	for (const step of steps) {
		if (step.status === 'Approved') {
			steps = setApprovedStepStatus({ project: { status: 'Approved' }, step, steps })
		}
	}
	return { tasks, steps }
}

function updateStepsProgress(task, steps) {
	return steps.map(item => {
		if (task.taskId === item.taskId) {
			item.progress = item.status === 'In progress' && item.targetFile ? 100 : item.progress
		}
		return item
	})
}

function updateWordcountStepsProgress({ steps, task }) {
	const { memoqDocs: docs } = task
	return steps.map(item => {
		if (task.taskId === item.taskId) {
			item.progress = item.status === 'In progress'
					? setStepsProgressByStepNumber(item.stepNumber, docs)
					: item.progress
			item.memoqDocIds = docs.map(item => item.DocumentGuid)
		}
		return item
	})
}

function setStepsProgressByStepNumber(stepNumber, docs) {
	const prop = stepNumber === 1 ? 'ConfirmedWordCount' : 'Reviewer1ConfirmedWordCount'
	const totalProgress = docs.reduce((acc, cur) => {
		acc.wordsDone = acc.wordsDone ? acc.wordsDone + +cur[prop] : +cur[prop]
		acc.totalWordCount = acc.totalWordCount ? acc.totalWordCount + +cur.TotalWordCount : +cur.TotalWordCount
		return acc
	}, {})
	let stepProgress = {}
	for (let doc of docs) {
		stepProgress[doc.DocumentGuid] = {
			wordsDone: +doc[prop],
			totalWordCount: +doc.TotalWordCount,
			fileName: doc.DocumentName
		}
	}
	return { ...stepProgress, ...totalProgress }
}

async function updateNonWordsTaskTargetFiles({ project, paths, jobId }) {
	const steps = project.steps.map(item => {
		if (item.id === jobId) {
			item.status = 'Completed'
			item.progress = 100
		}
		return item
	})

	const neededStep = steps.find(item => item.id.toString() === jobId.toString())

	const tasks = project.tasks.map(item => {
		if (neededStep.taskId === item.taskId) {
			let targetFiles = []
			const _idxStage = item.targetFilesStages.findIndex(item => item.stepId === neededStep._id)

			for (let path of paths) {
				targetFiles.push({ fileName: path.split("/").pop(), path: path.split('./dist').pop() })
			}

			if (_idxStage === -1) {
				item.targetFilesStages.push({ stepId: neededStep._id, files: targetFiles })
			} else {
				item.targetFilesStages[_idxStage].files = targetFiles
			}

			item.targetFiles = targetFiles
		}
		return item
	})

	try {
		return await updateProject({ "_id": project.id }, { steps, tasks })
	} catch (err) {
		console.log(err)
		console.log("Error in updateNonWordsTaskTargetFiles")
		throw new Error(err.message)
	}
}

async function getAfterReopenSteps(steps, project) {
	try {
		//CRASHED
		// const updatedSteps = setStepsStatus({ steps, status: 'Started', project })
		const stepIdentify = steps.map(item => item.taskId + item.name)
		const chosenSteps = updatedSteps.filter(item => stepIdentify.indexOf(item.taskId + item.name) !== -1)
		const updatedtasks = getTasksAfterReopen({ steps: chosenSteps, tasks: project.tasks })
		return await updateProject({ "_id": project.id }, {
			tasks: updatedtasks,
			steps: updatedSteps,
			status: 'In progress'
		})
	} catch (err) {
		console.log(err)
		console.log("Error in getAfterReopenSteps")
		throw new Error(err.message)
	}
}

function getTasksAfterReopen({ steps, tasks }) {
	let updatedTasks = [ ...tasks ]
	for (let step of steps) {
		if (step.status === 'Started') {
			let taskIndex = updatedTasks.findIndex(item => item.taskId === step.taskId)
			updatedTasks[taskIndex].status = "Started"
		}
	}
	return updatedTasks
}

async function updateOtherProject(query, update) {
	// return await MemoqProject.findOneAndUpdate(query, update, { new: false })
}

const assignMemoqTranslator = async (vendorId, stepId, projectId) => {
	const vendor = await Vendors.findOne({ _id: vendorId })
	const { steps, tasks } = await Projects.findOne({ _id: projectId }).populate('steps.vendor')
	const users = await getMemoqUsers()

	const neededStep = steps.find(step => step.stepId === stepId)
	const { taskId } = neededStep
	const { memoqProjectId } = tasks.find(item => item.taskId === taskId)

	let assignedSteps = []
	if (/(\sS02)/.exec(`${ stepId }`)) {
		assignedSteps.push(...steps.filter(item => item.taskId === taskId))
	} else {
		assignedSteps.push(neededStep)
	}
	assignedSteps = assignedSteps.filter(({ status }) => status !== 'Cancelled' && status !== 'Cancelled Halfway')

	let projectUsers = []
	const currentProjectUsers = await getProjectUsers(memoqProjectId)

	if (Array.isArray(currentProjectUsers)) {
		for (let userInfo of currentProjectUsers) assignPM(userInfo)
	} else {
		if (currentProjectUsers.hasOwnProperty('User')) assignPM(currentProjectUsers)
	}
	const memoqUser = users.find(user => user.id === vendor.guid || user.userName === vendor.memoqUserName || user.email === vendor.email)
	if (memoqUser) projectUsers.push({ id: memoqUser.id, isPm: false })

	const areUsersSet = await setMemoqProjectUsers(memoqProjectId, Array.from(new Set(projectUsers.filter((el, i, self) => self.map(item => item.id).indexOf(el.id) === i))))

	return areUsersSet ? await assignMemoqTranslators({ memoqProjectId, assignedSteps, users })
			: new Error("Can't set one or all users in memoQ")

	function assignPM({ ProjectRoles, User: { UserGuid } }) {
		const isPm = ProjectRoles['a:ProjectManager'] === 'true'
		projectUsers.push({ id: UserGuid, isPm })
	}
}

const assignProjectManagers = async ({ manager, memoqProjectId }) => {
	const users = await getMemoqUsers()
	const projectManagers = []
	const pm = await User.findOne({ _id: manager })
	projectManagers.push(await checkAndCreateManager(users, pm))
	await setMemoqProjectUsers(memoqProjectId, projectManagers)
}

const checkAndCreateManager = async (memoqUsers, manager) => {
	const memoqManager = memoqUsers.find(user => user.email === manager.email)

	if (memoqManager) {
		return { id: memoqManager.id, isPm: true }
	} else {
		const guid = await createMemoqUser({ firstName: manager.firstName, email: manager.email, surname: manager.lastName })
		return { id: guid, isPm: true }
	}
}

const checkProjectHasMemoqStep = async (projectId) => {
	let { steps } = await Projects.findOne({ _id: projectId })
	if (steps.length) {
		steps = steps.map(step => step.memoqProjectId)
		return Array.from(new Set(steps.filter(item => !!item)))
	}
	return []
}

const regainWorkFlowStatusByStepId = async (stepId, stepAction) => {
	let workFlowStatus
	let { steps, tasks } = await Projects.findOne({ 'steps.stepId': stepId }).populate('steps.step')
	const { taskId, stepNumber, step: { title: jobType }, memoqDocIds } = steps.find(item => item.stepId === stepId)
	const { memoqProjectId } = tasks.find(item => item.taskId === taskId)

	workFlowStatus = stepNumber === 1
			? (stepAction === 'Start' ? 'TranslationNotStarted' : 'Review1NotStarted')
			: (stepAction === 'Start' ? 'Review1NotStarted' : 'Completed')

	// if (jobType === 'Translation' || jobType === 'Post-Editing') {
	// 	workFlowStatus = stepAction === 'Start' ? 'TranslationNotStarted' : 'Review1NotStarted'
	// } else {
	// 	workFlowStatus = stepAction === 'Start' ? 'Review1NotStarted' : 'Completed'
	// }

	const updatedTasks = tasks.map(item => {
		if (item.taskId === taskId) {
			item.memoqDocs.map(doc => {
				doc.WorkflowStatus = workFlowStatus
			})
			return item
		} else {
			return item
		}
	})

	await Projects.updateOne({ 'steps.stepId': stepId }, { tasks: updatedTasks })

	return { workFlowStatus, memoqProjectId, memoqDocIds }
}

const setStepDeadlineProjectAndMemoq = async ({ projectId, stepId }) => {
	const users = await getMemoqUsers()
	const allVendors = await Vendors.find()
	let { steps, tasks } = await Projects.findOne({ '_id': projectId })

	const { taskId } = steps.find(item => item.stepId === stepId)

	const allTasksStep = steps
			.filter(item => item.taskId === taskId)
			.filter(({ status }) => status !== 'Cancelled' && status !== 'Cancelled Halfway')

	const currentStepIndex = allTasksStep.findIndex(item => item.stepId === stepId)

	if (currentStepIndex === 0) {
		const documentAssigment = generateStructure([ stepId ], steps)
		await setDeadlineByStepId(stepId, documentAssigment)
	}

	if (currentStepIndex === 1) {
		const mappedSteps = allTasksStep.map(({ stepId }) => stepId)
		const documentAssigment = generateStructure(mappedSteps, steps)
		for await (let stepId of mappedSteps) await setDeadlineByStepId(stepId, documentAssigment)
	}

	async function setDeadlineByStepId(stepId, structure) {
		const { memoqDocIds, taskId } = steps.find(item => item.stepId === stepId)
		const { memoqProjectId } = tasks.find(item => item.taskId === taskId)

		for await (let documentGuid of memoqDocIds)
			await setMemoqDocsDeadline(memoqProjectId, documentGuid, structure)
	}

	function generateStructure(arrIds, steps) {
		return arrIds.reduce((acc, curr) => {
			const { deadline, memoqAssignmentRole, vendor: vendorId } = steps.find(item => item.stepId === curr)

			const vendor = allVendors.find(({ _id }) => _id.toString() === vendorId.toString())
			const user = users.find(user => user.id === vendor.guid || user.userName === vendor.memoqUserName || user.email === vendor.email)

			acc = acc + `
					<ns:TranslationDocumentUserRoleAssignment>
					<ns:DeadLine>${ new Date(deadline).toISOString() }</ns:DeadLine>
					<ns:DocumentAssignmentRole>${ memoqAssignmentRole }</ns:DocumentAssignmentRole>
					<ns:UserGuid>${ user.id }</ns:UserGuid>
					</ns:TranslationDocumentUserRoleAssignment>
				`
			return acc
		}, '')
	}
}

module.exports = {
	manageReceivableVisible,
	generateTargetFileFromMemoq,
	reImportFilesFromMemoq,
	cancelProjectInMemoq,
	getProjectAfterCancelTasks,
	updateProjectStatus,
	downloadCompletedFiles,
	updateProjectProgress,
	updateWithApprovedTasks,
	getAfterReopenSteps,
	updateNonWordsTaskTargetFiles,
	updateOtherProject,
	assignMemoqTranslator,
	assignProjectManagers,
	checkProjectHasMemoqStep,
	regainWorkFlowStatusByStepId,
	setStepDeadlineProjectAndMemoq,
	setApprovedStepStatus
}
