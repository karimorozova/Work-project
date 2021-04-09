const updateTaskDataByCondition = (taskData) => {
	const { status } = taskData
	const taskDate = new Date(taskData.deadline).getTime()
	const timeNow = new Date().getTime()

	if (status === 'Completed') return taskData

	taskDate < timeNow ?
			(taskData.status = 'Overdue') :
			(taskData.status = 'Upcoming')

	return taskData
}

module.exports = {
	updateTaskDataByCondition
}