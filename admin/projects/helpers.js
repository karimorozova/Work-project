const { Step, Units } = require('../models')
const ObjectId = require('mongodb').ObjectID
const fs = require('fs')

// const gatherServiceStepInfo = async (serviceStep) => {
// 	const { stepId, title, unitId } = typeof serviceStep.step === 'string'
// 			? await getStepAndUnitEntity(serviceStep, 'title', 'type')
// 			: await getStepAndUnitEntity(serviceStep, '_id', '_id')
//
// 	serviceStep.step = ObjectId(stepId)
// 	serviceStep.unit = ObjectId(unitId)
// 	serviceStep.title = title
// 	return serviceStep
//
// 	async function getStepAndUnitEntity(serviceStep, stepKey, unitKey) {
// 		const { _id: stepId, title } = await Step.findOne({ [stepKey]: serviceStep.step })
// 		const { _id: unitId } = await Units.findOne({ [unitKey]: serviceStep.unit })
// 		return { stepId, title, unitId }
// 	}
// }

function getProjectFinance(tasks, projectFinance, minimumCharge) {
	return {
		fiance: {
			Price: { receivables: 12, payables: 13 }
		}
	}
	// const currentReceivables = projectFinance.Price.receivables || 0;
	// const currentPayables = projectFinance.Price.payables || 0;
	// const receivables = +(
	//   tasks.reduce((acc, cur) => acc + +cur.finance.Price.receivables, 0) +
	//   +currentReceivables
	// ).toFixed(2);
	// const payables = +(
	//   tasks.reduce((acc, cur) => acc + +cur.finance.Price.payables, 0) +
	//   +currentPayables
	// ).toFixed(2);
	// let roi = payables ? ((receivables - payables) / payables).toFixed(2) : 0;
	// if (minimumCharge) {
	//   const { value, toIgnore } = minimumCharge;
	//   if (!toIgnore && value > receivables) {
	//     roi = payables ? ((value - payables) / payables).toFixed(2) : 0
	//   }
	// }
	// return {
	//   projectFinance: {
	//     Price: { receivables, payables },
	//     Wordcount: { ...projectFinance.Wordcount }
	//   },
	//   roi
	// };
}


// function getFinanceForCustomUnits (task, steps) {
//   const taskSteps = steps.filter(
//     item => item.taskId === task.taskId || item.taskId === `${item.taskId} S01`
//   );
//   const receivables = +taskSteps
//     .reduce((acc, cur) => {
//       acc += +cur.finance.Price.receivables;
//       return acc;
//     }, 0)
//     .toFixed(2);
//   const payables = +taskSteps
//     .reduce((acc, cur) => {
//       acc += +cur.finance.Price.payables;
//       return acc;
//     }, 0)
//     .toFixed(2);
//   return {
//     ...task,
//     finance: {
//       Price: { receivables, payables },
//       Wordcount: { receivables: '', payables: '' }
//     }
//   };
// }

function getModifiedFiles(files) {
	if (files && files.length) {
		return files.map(item => {
			item.path = `./dist${ item.path }`
			item.filename = item.fileName
			return item
		})
	}
	return []
}

function createProjectFolder(projectId) {
	return new Promise((resolve, reject) => {
		fs.mkdir(`./dist/projectFiles/${ projectId }`, err => {
			if (err) reject(err)
			resolve('ok')
		})
	})
}

// const setTaskFinance = (steps, prop) => {
// 	return steps.reduce((acc, cur) => {
// 		const receivables = +cur.finance[prop].receivables
// 		const payables = +cur.finance[prop].payables
// 		acc.receivables = acc.receivables ? +(acc.receivables + receivables).toFixed(2) : receivables
// 		acc.payables = acc.payables ? +(acc.payables + payables).toFixed(2) : payables
// 		return acc
// 	}, {})
// }

const getPriceAfterApplyingDiscounts = (clientDiscounts, price) => {
	let finalPrice = +price

	const totalValueDiscount = clientDiscounts.reduce((acc, curr) => acc + +curr.value, 0)
	finalPrice = totalValueDiscount < 0 ? subtractDiscount(Math.abs(totalValueDiscount), finalPrice) : addSurcharge(totalValueDiscount, finalPrice)
	return +finalPrice.toFixed(2)

	function subtractDiscount(discount, price) {
		return price * (1 - discount / 100)
	}

	function addSurcharge(surcharge, price) {
		return price * (1 + surcharge / 100)
	}
}

const manageProjectName = (tasksInfo) => {
	tasksInfo.nativeProjectName = tasksInfo.nativeProjectName.replace(/( *[^\w\s\.]+ *)+/g, ' ').trim()
	if (!tasksInfo.nativeProjectName.trim().length) tasksInfo.nativeProjectName = "Png"
	if (Number.isInteger(+tasksInfo.nativeProjectName.charAt(0))) tasksInfo.nativeProjectName = 'Png ' + tasksInfo.nativeProjectName
	return tasksInfo
}

module.exports = {
	manageProjectName,
	// gatherServiceStepInfo,
	getProjectFinance,
	// getFinanceForCustomUnits,
	getModifiedFiles,
	createProjectFolder,
	// setTaskFinance,
	getPriceAfterApplyingDiscounts
}
