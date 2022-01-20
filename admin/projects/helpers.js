const { Step, Units } = require('../models')
const ObjectId = require('mongodb').ObjectID
const fs = require('fs')

const filterNotQuoteStepsInStartedProjectForClientPortal = (project) => {
	const { steps, status, tasks, minimumCharge } = project

	if ((status === 'In progress' || status === 'Approved') && !minimumCharge.isUsed) {
		const createdTasks = tasks.filter(({ status }) => status !== 'Quote sent' && status !== 'Created')

		if (createdTasks.length) {
			const tasksIds = createdTasks.map(i => i.taskId).filter(Boolean)
			return steps.filter(({ taskId }) => tasksIds.includes(taskId))
		}
	}
	return steps
}

const filterQuoteStepsInStartedProjectForClientPortal = (project) => {
	const { steps, status, tasks, minimumCharge } = project

	if ((status === 'In progress' || status === 'Approved') && !minimumCharge.isUsed) {
		const createdTasks = tasks.filter(({ status }) => status === 'Quote sent')

		if (createdTasks.length) {
			const tasksIds = createdTasks.map(i => i.taskId).filter(Boolean)
			return steps.filter(({ taskId }) => tasksIds.includes(taskId))
		}
	}
	return []
}


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
	if (!tasksInfo.nativeProjectName.trim().length) tasksInfo.nativeProjectName = "P"
	if (Number.isInteger(+tasksInfo.nativeProjectName.charAt(0))) tasksInfo.nativeProjectName = 'P ' + tasksInfo.nativeProjectName
	return tasksInfo
}

module.exports = {
	filterQuoteStepsInStartedProjectForClientPortal,
	filterNotQuoteStepsInStartedProjectForClientPortal,
	manageProjectName,
	getProjectFinance,
	getModifiedFiles,
	createProjectFolder,
	getPriceAfterApplyingDiscounts
}
