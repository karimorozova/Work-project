function setTaskMetrics({ metrics, matrix, prop }) {
	let taskMetrics = { ...metrics }
	for (let key in matrix) {
		taskMetrics[key][prop] = +matrix[key].rate
	}
	return taskMetrics
}

module.exports = {
	setTaskMetrics
}
