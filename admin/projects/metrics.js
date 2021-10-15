const { getProject, updateProject } = require('./getProjects')
const { Step, Units, Vendors } = require('../models')
const { getStepFinanceData } = require('../сalculations/finance')
const {
	setTaskMetrics
} = require('../сalculations/wordcount')
const { getFittingVendor, checkIsSameVendor } = require('../сalculations/vendor')
const { getProjectAnalysis } = require('../services/memoqs/projects')
const ObjectId = require('mongodb').ObjectID


async function updateProjectMetricsAndCreateSteps(projectId, tasks) {
	try {
		const project = await getProject({ "_id": projectId })
		let { steps, customer, tasks: existingTasks, industry, discounts } = project
		let isMetricsExist = true

		if (!tasks) tasks = existingTasks.filter(task => !task.hasOwnProperty('metrics'))

		filterExistingTasks()

		for await (let task of tasks) {
			const { stepsAndUnits } = task
			const isIncludesWordCount = stepsAndUnits.find(item => item.unit === 'CAT Wordcount')

			if (!!isIncludesWordCount && task.status === "Created") {
				const analysis = await tryToGetMemoqMetrics(task.memoqProjectId, undefined)

				if (analysis) {
					const taskMetrics = getTaskMetrics({ task, matrix: project.customer.matrix, analysis })
					task.metrics = task.metrics || { ...taskMetrics }

					let newSteps = await generateStepsForCATTasks(task, industry, customer, discounts, projectId)
					newSteps = checkIsSameVendor(newSteps)

					const stepWithVendor = newSteps.find(step => step.vendor)
					if (stepWithVendor) {
						const vendor = await Vendors.findOne({ _id: stepWithVendor.vendor._id })
						if (vendor) task.metrics = setTaskMetrics({ metrics: task.metrics, matrix: vendor.matrix, prop: 'vendor' })
					}
					steps.push(...newSteps)
				} else {
					isMetricsExist = false
				}
			}
		}

		existingTasks.push(...tasks)

		return await updateProject({ "_id": projectId }, { tasks: existingTasks, steps, isMetricsExist })

		function filterExistingTasks() {
			const newTasksIds = tasks.map(i => i.taskId)
			existingTasks = existingTasks.filter(({ taskId }) => !newTasksIds.includes(taskId))
		}
	} catch (err) {
		console.log(err)
		console.log("Error in updateProjectMetricsAndCreateSteps")
	}
}

async function tryToGetMemoqMetrics(memoqProjectId, analysis) {
	return new Promise(async (resolve, reject) => {
		if (analysis) {
			resolve(analysis)
		} else {
			analysis = await getProjectAnalysis(memoqProjectId)
			setTimeout(async () => {
				resolve (await tryToGetMemoqMetrics(memoqProjectId, analysis))
			}, 400)
		}
	})
}


function getTaskMetrics({ task, matrix, analysis }) {
	const { AnalysisResultForLang } = analysis
	let targetMetrics = AnalysisResultForLang
	if (Array.isArray(AnalysisResultForLang)) {
		targetMetrics = AnalysisResultForLang.find(({ TargetLangCode }) => TargetLangCode === task.memoqTarget)
	}
	const { Summary } = targetMetrics
	const metrics = Object.keys(Summary).reduce((acc, cur) => {
		const { SourceWordCount } = Summary[cur]
		return cur !== 'Fragments' ? { ...acc, [cur]: +SourceWordCount } : acc
	}, {})

	const memoqFilledMetrics = getFilledMemoqMetrics(metrics)
	let taskMetrics = setTaskMetrics({ metrics: memoqFilledMetrics, matrix, prop: "client" })
	return { ...taskMetrics, totalWords: metrics.All }
}

function getFilledMemoqMetrics(metrics) {
	const { Hit50_74, Hit101, Hit100, NoMatch, Repetition, Hit75_84, Hit85_94, XTranslated, Hit95_99 } = metrics
	return {
		xTranslated: { text: "X translated", value: +XTranslated },
		repeat: { text: "Repetition", value: +Repetition },
		contextMatch: { text: "Context match", value: +Hit101 },
		repeat100: { text: "100%", value: +Hit100 },
		repeat50: { text: "50-74%", value: +Hit50_74 },
		repeat75: { text: "75-84%", value: +Hit75_84 },
		repeat85: { text: "85-94%", value: +Hit85_94 },
		repeat95: { text: "95-99%", value: +Hit95_99 },
		noMatch: { text: "No match", value: +NoMatch }
	}
}


// async function getProjectWithUpdatedFinance(project) {
// 	let projectToUpdate = { ...project._doc, id: project.id }
// 	let { tasks, steps } = projectToUpdate
// 	try {
// 		for (let step of steps) {
// 			const parsedStep = JSON.parse(JSON.stringify(step))
// 			if (!step.finance.Price.receivables && parsedStep.serviceStep.unit === 'CAT Wordcount') {
// 				let taskIndex = tasks.findIndex(item => item.taskId === step.taskId)
//
// 				//FIN53
// 				// const receivables = step.finance.Price.receivables ? {
// 				// 			rate: step.clientRate, cost: +step.finance.Price.receivables
// 				// 		}
// 				// 		: await receivablesCalc({ task: tasks[taskIndex], project: projectToUpdate, step })
//
// 				step.clientRate = receivables.rate
// 				step.finance.Price.receivables = receivables.cost
// 				tasks[taskIndex].finance.Price.receivables = +(tasks[taskIndex].finance.Price.receivables + step.finance.Price.receivables).toFixed(2)
// 			}
// 		}
// 		return { ...projectToUpdate, tasks, steps }
// 	} catch (err) {
// 		console.log(err)
// 		console.log("Error in getProjectWithUpdatedFinance")
// 	}
// }


async function generateStepsForCATTasks(task, industry, customer, discounts, projectId) {
	let { sourceLanguage, targetLanguage, metrics, service, stepsAndUnits } = task
	const newSteps = []
	let counter = 1

	for (let i = 0; i < task.stepsDates.length; i++) {
		let stepsIdCounter = counter < 10 ? `S0${ counter }` : `S${ counter }`
		const { _id: stepId } = await Step.findOne({ title: stepsAndUnits[i].step })
		const { _id: unitId } = await Units.findOne({ type: stepsAndUnits[i].unit })
		const serviceStep = {
			step: ObjectId(stepId),
			unit: ObjectId(unitId),
			size: stepsAndUnits[i].size || 1,
			memoqAssignmentRole: i,
			title: stepsAndUnits[i].step
		}
		const vendorId = await getFittingVendor({ sourceLanguage, targetLanguage, step: serviceStep.step, industry })

		if (vendorId) {
			const vendor = await Vendors.findOne({ _id: vendorId })
			task.metrics = setTaskMetrics({ metrics: metrics, matrix: vendor.matrix, prop: 'vendor' })
		}

		const quantity = { receivables: metrics.totalWords, payables: metrics.totalWords }

		const { finance, clientRate, vendorRate, vendor, defaultStepPrice, nativeFinance, nativeVendorRate } =
				await getStepFinanceData({ customer, industry, serviceStep, task, vendorId, quantity, discounts, projectId }, true)
		//TODO: refactoring Services/Step
		const step = {
			stepId: `${ task.taskId } ${ stepsIdCounter }`,
			taskId: task.taskId,
			serviceStep,
			name: stepsAndUnits[i].step,
			sourceLanguage,
			targetLanguage,
			memoqProjectId: task.memoqProjectId,
			memoqSource: task.memoqSource,
			memoqTarget: task.memoqTarget,
			memoqDocIds: task.memoqDocs.map(({ DocumentGuid }) => DocumentGuid),
			vendor: ObjectId(vendor),
			start: task.stepsDates[i].start || task.start,
			deadline: task.stepsDates[i].deadline,
			progress: setStepsProgress(serviceStep.symbol, task.memoqDocs),
			status: "Created",
			clientRate,
			finance,
			defaultStepPrice,
			vendorRate,
			totalWords: metrics.totalWords,
			vendorsClickedOffer: [],
			isVendorRead: false,
			service,
			nativeFinance,
			nativeVendorRate
		}

		newSteps.push(step)
		counter++
	}
	return newSteps
}


function setStepsProgress(symbol, docs) {
	//TODO: refactoring Services/Step  stepTitle+unit
	const prop = symbol === 'translation' ? 'ConfirmedWordCount' : 'Reviewer1ConfirmedWordCount'
	const totalProgress = docs.reduce((acc, cur) => {
		acc.wordsDone = acc.wordsDone ? acc.wordsDone + +cur[prop] : +cur[prop]
		const { TotalWordCount } = cur
		acc.totalWordCount = acc.totalWordCount ? acc.totalWordCount + +TotalWordCount : +TotalWordCount
		return acc
	}, {})
	let stepProgress = {}
	for (let doc of docs) {
		const { DocumentGuid, TotalWordCount, DocumentName } = doc
		stepProgress[DocumentGuid] = {
			wordsDone: +doc[prop], totalWordCount: +TotalWordCount, fileName: DocumentName
		}
	}
	return { ...stepProgress, ...totalProgress }
}

module.exports = {
	updateProjectMetricsAndCreateSteps
	// getProjectWithUpdatedFinance
}
