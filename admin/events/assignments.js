const EventEmitter = require('events')
const { stepMiddleReassignedNotification, stepMiddleAssignNotification } = require("../utils")
const emitter = new EventEmitter()

emitter.on('vendor-notification', async (oldStep, reason, isPay, newStep, isStart) => {
	await stepMiddleReassignedNotification(oldStep, reason, isPay)
	await stepMiddleAssignNotification(newStep, isStart)
})


module.exports = { assignmentsEmitter: emitter }
