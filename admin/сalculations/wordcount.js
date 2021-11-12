
function setTaskMetrics({ metrics, matrix, prop }) {
	let taskMetrics = { ...metrics }
	for (let key in matrix) {
		taskMetrics[key][prop] = +matrix[key].rate
	}
	return taskMetrics
}

async function updateProjectCosts(project) {
	console.log('updateProjectCosts77')
	// let finance = {
	// 	Wordcount: getProjectFinanceData(project, 'Wordcount'),
	// 	Price: getProjectFinanceData(project, 'Price')
	// }
	// const { receivables, payables } = finance.Price
	// const roi = payables ? ((receivables - payables) / payables).toFixed(2) : 0
	// try {
	// 	const checkStatuses = [ 'Quote sent', 'Approved' ]
	// 	const isPriceUpdated = checkStatuses.indexOf(project.status) !== -1
	// 	return await updateProject({ '_id': project.id }, {
	// 		tasks: project.tasks,
	// 		steps: project.steps,
	// 		finance,
	// 		isPriceUpdated,
	// 		roi
	// 	})
	// } catch (err) {
	// 	console.log(err)
	// 	console.log('Error in updateProjectCosts')
	// }
}

module.exports = {
	updateProjectCosts,
	setTaskMetrics,
}
