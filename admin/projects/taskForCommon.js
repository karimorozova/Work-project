const { updateProject, getProject } = require("./getProjects")
const { getNewStepFinanceData, calculateProjectTotal, recalculateStepFinance } = require('../сalculations/finance')
const ObjectId = require('mongodb').ObjectID

async function createTasksAndStepsForCustomUnits(tasksInfo, iterator = 0) {
	const {
		refFiles,
		sourceFiles,
		stepsAndUnits,
		stepsAdditions,
		service,
		targets,
		source,
		projectId: _id,
		internalProjectId: projectId
	} = tasksInfo

	const { tasks: projectsTasks, isSkipProgress } = await getProject({ _id })

	try {
		let tasks = await generateTasksForCustomUnits({ source, service, targets, stepsAndUnits, projectsTasks, projectId, refFiles, sourceFiles, isSkipProgress }, iterator)
		let { steps, additions } = await generateStepsForCustomUnits({ tasks, stepsAdditions })
		await updateProject({ _id }, { $push: { tasks, steps, additionsSteps: additions } })
		await recalculateStepFinance(_id)
		return await calculateProjectTotal(_id)

	} catch (err) {
		console.log(err)
		console.log("Error in createTasksAndStepsForCustomUnits")
	}
}

async function generateTasksForCustomUnits({ source, service, targets, stepsAndUnits, projectsTasks, projectId, refFiles, sourceFiles, isSkipProgress }, iterator) {
	let tasks = []
	let tasksLength = projectsTasks.length + 1
	const isDuo = service.languageForm === 'Duo'

	for (const item of targets) {
		const idNumber = tasksLength < 10 ? `T0${ tasksLength + iterator }` : `T${ tasksLength + iterator }`
		const taskId = projectId + ` ${ idNumber }`
		tasks.push({
			projectId,
			taskId,
			service,
			stepsAndUnits,
			memoqSource: isDuo ? source.memoq : item.memoq,
			memoqTarget: item.memoq,
			sourceLanguage: isDuo ? source.symbol : item.symbol,
			targetLanguage: item.symbol,
			fullSourceLanguage: isDuo ? source : item,
			fullTargetLanguage: item,
			refFiles,
			sourceFiles,
			...(isSkipProgress && { status: 'Completed' })
		})
		tasksLength++
	}

	return tasks
}

async function generateStepsForCustomUnits({ tasks, stepsAdditions }) {
	const steps = []
	const additions = []

	for (const task of tasks) {
		const { projectId, taskId, service, stepsAndUnits, memoqSource, memoqTarget, sourceLanguage, targetLanguage, fullSourceLanguage, fullTargetLanguage, metrics, status } = task
		for (let i = 0; i < stepsAndUnits.length; i++) {

			const { finance, nativeFinance, defaultStepPrice, clientRate, vendorRate, nativeVendorRate } =
					await getNewStepFinanceData({
						projectId,
						fullSourceLanguage,
						fullTargetLanguage,
						metrics,
						step: stepsAndUnits[i].step,
						receivablesUnit: stepsAndUnits[i].receivables.unit,
						receivablesQuantity: stepsAndUnits[i].receivables.quantity,
						payablesQuantity: stepsAndUnits[i].payables.quantity
					}, false)

			if (stepsAndUnits[i].hasOwnProperty('isReceivableVisible') && !stepsAndUnits[i].isReceivableVisible) {
				finance.Quantity.receivables = 0
				finance.Wordcount.receivables = 0
			}

			steps.push({
				stepNumber: i + 1,
				projectId,
				stepId: `${ taskId } ${ i + 1 < 10 ? `S0${ i + 1 }` : `S${ i + 1 }` }`,
				taskId,
				service,
				progress: 0,
				step: stepsAndUnits[i].step,
				receivablesUnit: stepsAndUnits[i].receivables.unit,
				payablesUnit: stepsAndUnits[i].payables.unit,
				memoqSource,
				memoqTarget,
				sourceLanguage,
				targetLanguage,
				fullSourceLanguage,
				fullTargetLanguage,
				isReceivableVisible: stepsAndUnits[i].isReceivableVisible,
				start: stepsAndUnits[i].start,
				deadline: stepsAndUnits[i].deadline,
				stepAndUnit: stepsAndUnits[i],
				finance,
				nativeFinance,
				defaultStepPrice,
				clientRate,
				vendorRate,
				nativeVendorRate,
				...(status && { status: 'Completed' })
			})
		}

		for (let i = 0; i < stepsAdditions.length; i++) {
			additions.push({
				projectId,
				taskId,
				title: stepsAdditions[i].title,
				finance: {
					Price: {
						receivables: stepsAdditions[i].value
					}
				}
			})
		}

	}
	return { steps, additions }
}

module.exports = { createTasksAndStepsForCustomUnits }
