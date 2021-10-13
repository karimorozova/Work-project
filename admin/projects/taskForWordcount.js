const { Projects } = require('../models')

async function createTasksForWordcount(newTasksInfo, docs) {
	try {
		const project = await Projects.findOne({ _id: newTasksInfo.projectId })
		return await addTasksToProject({ newTasksInfo, project, docs })
	} catch (err) {
		console.log(err)
		console.log("Error in createTasksWithWordsUnit")
	}
}

async function addTasksToProject({ newTasksInfo, project, docs }) {
	try {
		const currTargets = newTasksInfo.targets.map(item => item.memoq)
		const memoqDocs = Array.isArray(docs)
				? docs.filter(({ TargetLangCode }) => currTargets.includes(TargetLangCode))
				: [ docs ]

		return await updateProjectTasks({ newTasksInfo, project, memoqDocs })
	} catch (err) {
		console.log(err)
		console.log("Error in addTasksToProject")
	}
}

async function updateProjectTasks(taskData) {
	const { project } = taskData
	try {
		const tasks = getWordCountTasks(taskData)
		await Projects.updateOne({ _id: project._id }, { $set: { isMetricsExist: false }, $push: { tasks } })
		return tasks
	} catch (err) {
		console.log(err)
		console.log("Error in updateProjectTasks")
	}
}

function getWordCountTasks({ project, newTasksInfo, memoqDocs }) {
	const { service, stepsAndUnits, memoqProjectId, stepsDates, source, targets, memoqFiles, translateFiles, referenceFiles } = newTasksInfo
	const tasks = []
	let tasksLength = project.tasks.length + 1

	for (let i = 0; i < targets.length; i++) {
		let idNumber = tasksLength < 10 ? `T0${ tasksLength }` : `T${ tasksLength }`
		let taskId = project.projectId + ` ${ idNumber }`

		tasks.push({
			taskId,
			service,
			stepsAndUnits: typeof stepsAndUnits === 'string' ? JSON.parse(stepsAndUnits) : stepsAndUnits,
			memoqProjectId,
			stepsDates,
			sourceLanguage: source.symbol,
			targetLanguage: targets[i].symbol,
			memoqSource: source.memoq,
			memoqTarget: targets[i].memoq,
			memoqDocs: memoqDocs.filter(item => `${ item.TargetLangCode }` === `${ targets[i].memoq }`),
			memoqFiles: memoqFiles,
			status: "Created",
			sourceFiles: translateFiles,
			refFiles: referenceFiles
		})
		tasksLength++
	}
	return tasks
}

module.exports = { createTasksForWordcount }
