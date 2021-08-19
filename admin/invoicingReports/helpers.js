const clearReportsStepsPrivateKeys = async (reports) => {
	const privateKeys = [
		'finance',
		'nativeFinance.Price.receivables',
		'refFiles',
		'defaultStepPrice',
		'clientRate',
		'targetFile',
		'vendor',
		'service',
		'memoqDocIds'
	]

	return await reports.map(report => {
		const steps = report.steps.map(step => {
			for (let key of privateKeys) delete step[key]
			return step
		})
		return { ...report, steps }
	})
}

module.exports = { clearReportsStepsPrivateKeys }