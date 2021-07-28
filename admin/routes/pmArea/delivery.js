const router = require('express').Router()
const fs = require('fs')
const {
	User,
} = require('../../models')

const {
	addDR2,
	addMultiLangDR2,
	removeDR2,
	removeMultiDR2,
	taskApproveReady,
	taskApproveNotify,
	taskApproveDeliver,
	taskApproveDeliverMany,
	getProject,
	getProjectAfterUpdate,
	updateProject,
	changeManagerDR2,
	changeManager,
	rollbackReview,
	targetFileDR2,
	changeTaskStatus,
	targetFileDR1,
	approveInstructionDR2,
	approveFilesDR2,
	changeManagersDR1
} = require("../../projects")

const {
	Projects
} = require('../../models')

const { upload } = require('../../utils')

router.post('/rollback-review', async (req, res) => {
	const { entityId, taskId, projectId, manager } = req.body
	try {
		const updatedProject = await rollbackReview({ entityId, taskId, projectId, manager })
		res.send(updatedProject)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on rollback-review')
	}
})

router.post('/change-manager-dr2', async (req, res) => {
	const { projectId, manager, type, file, entityId } = req.body
	try {
		const project = await getProject({ '_id': projectId })
		let prevManager = await User.findOne({ "_id": file.dr2Manager }).populate('group')
		const updatedProject = await changeManagerDR2({ project, prevManager, manager, type, file, entityId })
		res.send(updatedProject)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on changing review manager')
	}
})

router.post('/target-dr2', upload.fields([ { name: 'targetFile' } ]), async (req, res) => {
	const fileData = { ...req.body }
	const files = req.files['targetFile']
	try {
		const updatedProject = await targetFileDR2(fileData, files)
		res.send(updatedProject)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on target-dr2')
	}
})

router.post('/remove-dr2-file', async (req, res) => {
	const {  type, taskId, projectId, path, entityId } = req.body
	try {
		if (type === 'single') {
			if (taskId !== 'Loaded in DR2') {
				await Projects.updateOne(
						{ "_id": projectId, 'tasksDR1.files.path': path },
						{ $pull: { 'tasksDR1.$[i].files': { path } } },
						{ arrayFilters: [ { 'i.taskId': taskId } ] }
				)
			}
			await Projects.updateOne(
					{ "_id": projectId, 'tasksDR2.singleLang._id': entityId, "tasksDR2.singleLang.files.path": path },
					{ $pull: { "tasksDR2.singleLang.$[i].files": { path } } },
					{ arrayFilters: [ { 'i._id': entityId } ] }
			)

		}else{
			await Projects.updateOne(
					{ "_id": projectId, 'tasksDR2.multiLang._id': entityId, "tasksDR2.multiLang.file.path": path },
					{ $pull: { "tasksDR2.multiLang.$[i].file": { path } } },
					{ arrayFilters: [ { 'i._id': entityId } ] }
			)

		}

		if(await fs.existsSync(`./dist${path}`)) {
			fs.unlink(`./dist${ path }`, (err) => {
				if (err) throw(err)
			})
		}
		const updatedProject = await getProject({ "_id": projectId })
		res.send(updatedProject)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on removing dr file')
	}
})

router.post('/delivery-comments-dr2', async (req, res) => {
	const { projectId, entityId, type, comment } = req.body
	try {
		if (type === 'single') {
			const updatedProject = await getProjectAfterUpdate(
					{ "_id": projectId, 'tasksDR2.singleLang._id': entityId },
					{ $set: { "tasksDR2.singleLang.$.comment": comment } }
			)
			res.send(updatedProject)
		} else {
			const updatedProject = await getProjectAfterUpdate(
					{ "_id": projectId, 'tasksDR2.multiLang._id': entityId },
					{ $set: { "tasksDR2.multiLang.$.comment": comment } }
			)
			res.send(updatedProject)
		}
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on delivery-comments')
	}
})

router.post('/change-task-status', async (req, res) => {
	const { taskId, projectId } = req.body
	try {
		const updatedProject = await changeTaskStatus({ taskId, projectId })
		res.send(updatedProject)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on approve files')
	}
})

router.post('/is-file-pushed-dr2', async (req, res) => {
	const { projectId, taskId, isFilePushedDR2, paths } = req.body
	try {
		await Projects.updateOne(
				{ "_id": projectId, 'tasksDR1.taskId': taskId, "tasksDR1.files.path": { $in: paths } },
				{ "tasksDR1.$[i].files.$[j].isFilePushedDR2": isFilePushedDR2 },
				{ arrayFilters: [ { 'i.taskId': taskId }, { 'j.path': { $in: paths } } ] }
		)
		const updatedProject = await getProject({ "_id": projectId })
		res.send(updatedProject)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on approve files')
	}
})

router.post('/target', upload.fields([ { name: 'targetFile' } ]), async (req, res) => {
	const fileData = { ...req.body }
	const files = req.files['targetFile']
	try {
		const updatedProject = await targetFileDR1(fileData, files)
		res.send(updatedProject)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on changing review manager')
	}
})

router.post('/approve-files-dr2', async (req, res) => {
	const { type, entityId, projectId, isFileApproved, paths } = req.body
	try {
		const updatedProject = await approveFilesDR2({ type, entityId, projectId, isFileApproved, paths })
		res.send(updatedProject)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on approve files')
	}
})

router.post('/approve-instruction-dr2', async (req, res) => {
	const { entityId, projectId, instruction, type } = req.body
	try {
		const updatedProject = await approveInstructionDR2({ entityId, projectId, instruction, type })
		res.send(updatedProject)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on approve files')
	}
})

router.post('/remove-dr-file', async (req, res) => {
	const { taskId, path, projectId } = req.body
	try {
		await Projects.updateOne({ "_id": projectId, 'tasksDR1.files.path': path }, { $pull: { 'tasksDR1.$[i].files': { path } } }, { arrayFilters: [ { 'i.taskId': taskId } ] })
		if(await fs.existsSync(`./dist${path}`)) {
			fs.unlink(`./dist${ path }`, (err) => {
				if (err) throw(err)
			})
		}
		const updatedProject = await getProject({ "_id": projectId })
		res.send(updatedProject)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on removing dr file')
	}
})

router.post('/tasks-approve-deliver-many', async (req, res) => {
	const { projectId, entitiesForDeliver, user, contacts, comment } = req.body
	try {
		const updatedProject = await taskApproveDeliverMany({ projectId, entitiesForDeliver, user, contacts, comment })
		res.send(updatedProject)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on approving deliverable')
	}
})

router.post('/tasks-approve-notify', async (req, res) => {
	const { projectId, type, entityId, contacts } = req.body
	try {
		const updatedProject = await taskApproveNotify({ projectId, type, entityId, contacts })
		res.send(updatedProject)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on approving deliverable')
	}
})

router.post('/tasks-approve-deliver', async (req, res) => {
	const { projectId, type, entityId, user, contacts, comment } = req.body
	try {
		const updatedProject = await taskApproveDeliver({ projectId, type, entityId, user, contacts, comment })
		res.send(updatedProject)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on approving deliverable')
	}
})

router.post('/tasks-approve-ready', async (req, res) => {
	const { projectId, type, entityId } = req.body
	try {
		const updatedProject = await taskApproveReady({ projectId, type, entityId })
		res.send(updatedProject)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on approving deliverable')
	}
})

router.post('/file-dr2-push', async (req, res) => {
	const { projectId, taskId, dr1Manager, dr2Manager, files } = req.body
	try {
		const DR2 = await addDR2({ projectId, taskId, dr1Manager, dr2Manager, files })
		res.send('DR2')
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on file-dr2-push')
	}
})

router.post('/file-dr2-pull', async (req, res) => {
	const { projectId, taskId, path, sourceLanguage, targetLanguage } = req.body
	try {
		const DR2 = await removeDR2({ projectId, taskId, path, sourceLanguage, targetLanguage })
		res.send('DR2')
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on file-dr2-pull')
	}
})

router.post('/multi-file-dr2-push', upload.fields([ { name: 'refFiles' } ]), async (req, res) => {
	const { projectId, taskIds, filesFromVault } = req.body
	const { refFiles } = req.files
	try {
		const DR2 = await addMultiLangDR2({ projectId, taskIds: JSON.parse(taskIds), refFiles, filesFromVault: JSON.parse(filesFromVault) })
		res.send(DR2)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on multi-file-dr2-push')
	}

})

router.post('/multi-file-dr2-remove', async (req, res) => {
	const { projectId, type, dr2Id } = req.body
	try {
		const DR2 = await removeMultiDR2({ projectId, type, dr2Id })
		res.send(DR2)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on multi-file-dr2-push')
	}
})

router.post('/change-manager', async (req, res) => {
	const { projectId, taskId, manager, prop, isAdmin, status } = req.body
	try {
		const project = await getProject({ '_id': projectId })
		const prevManager = await User.findOne({ "_id": project.tasksDR1.find(item => item.taskId === taskId)[prop] }).populate('group')
		const updatedProject = await changeManager({ taskId, manager, prevManager, prop, isAdmin, status, project })
		res.send(updatedProject)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on changing review manager')
	}
})

router.post('/approve-instruction', async (req, res) => {
	const { taskId, projectId, instruction } = req.body
	try {
		await Projects.updateOne(
				{ "_id": projectId, 'tasksDR1.taskId': taskId, "tasksDR1.instructions.text": instruction.text },
				{ "tasksDR1.$[i].instructions.$[j].isChecked": instruction.isChecked, "tasksDR1.$[i].instructions.$[j].isNotRelevant": instruction.isNotRelevant },
				{ arrayFilters: [ { 'i.taskId': taskId }, { 'j.text': instruction.text } ] }
		)
		const updatedProject = await getProject({ "_id": projectId })
		res.send(updatedProject)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on approve files')
	}
})

router.post('/delivery-comments', async (req, res) => {
	const { projectId, taskId, comment } = req.body
	try {
		const updatedProject = await getProjectAfterUpdate({ "_id": projectId, "tasksDR1.taskId": taskId }, { $set: { "tasksDR1.$.comment": comment } })
		res.send(updatedProject)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on delivery-comments')
	}
})

router.post('/approve-files', async (req, res) => {
	const { projectId, taskId, isFileApproved, paths } = req.body
	try {
		await Projects.updateOne(
				{ "_id": projectId, 'tasksDR1.taskId': taskId, "tasksDR1.files.path": { $in: paths } },
				{ "tasksDR1.$[i].files.$[j].isFileApproved": isFileApproved },
				{ arrayFilters: [ { 'i.taskId': taskId }, { 'j.path': { $in: paths } } ] }
		)
		const updatedProject = await getProject({ "_id": projectId })
		res.send(updatedProject)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on approve files')
	}
})

router.post('/remove-reference-files', async (req, res) => {
	try {
		const { projectId, checkedTasksId, filePath } = req.body
		let { _id, tasks } = await getProject({ '_id': projectId })

		fs.unlink(filePath, (err) => {
			if (err) throw(err)
		})

		const taskIndex = tasks.findIndex(({ taskId }) => taskId === checkedTasksId)
		tasks[taskIndex].refFiles = tasks[taskIndex].refFiles.filter(item => item !== filePath)
		const updatedProject = await updateProject({ '_id': _id }, { tasks })
		res.send(updatedProject)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on adding tasks ref files')
	}
})

router.post('/change-managers', async (req, res) => {
	try {
		const { projectId, checkedTasksId, manager } = req.body
		const updatedProject = await changeManagersDR1({ projectId, checkedTasksId, manager })
		res.send(updatedProject)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on adding tasks ref files')
	}
})


module.exports = router
