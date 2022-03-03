const returnMessageAndType = (message, type) => {
	return {
		type,
		message: message || 'Internal error'
	}
}

module.exports = {
	returnMessageAndType
}