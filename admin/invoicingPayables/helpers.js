const clearPayablesStepsPrivateKeys = async (reports) => {
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
			for (let key of privateKeys) {
				if (!key.includes('.')) {
					delete step[key]
				} else {
					const newKeys = key.split('.')
					switch (newKeys.length) {
						case 2: {
							const [ a, b ] = newKeys
							delete step[a][b]
						}
							break
						case 3: {
							const [ a, b, c ] = newKeys
							delete step[a][b][c]
						}
							break
					}
				}
			}
			return step
		})
		return { ...report, steps }
	})
}

module.exports = { clearPayablesStepsPrivateKeys }