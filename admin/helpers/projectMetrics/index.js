const getRelativeQuantity = (metrics, key) => {
	const { totalWords, ...rest } = metrics
	let counter = 0
	for (let item in rest) {
		if (rest.hasOwnProperty(item)) {
			counter += (rest[item].value * rest[item][key]) / 100
		}
	}
	return counter
}

function getMemoqMetrics(metrics) {
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

function getMemoqMetricsForUndefinedDocuments(weightedWords) {
	return {
		xTranslated: { text: "X translated", value: 0 },
		repeat: { text: "Repetition", value: 0 },
		contextMatch: { text: "Context match", value: 0 },
		repeat100: { text: "100%", value: 0 },
		repeat50: { text: "50-74%", value: 0 },
		repeat75: { text: "75-84%", value: 0 },
		repeat85: { text: "85-94%", value: 0 },
		repeat95: { text: "95-99%", value: 0 },
		noMatch: { text: "No match", value: weightedWords }
	}
}

function setTaskMetrics({ metrics, matrix, prop }) {
	let taskMetrics = { ...metrics }
	for (let key in matrix) {
		taskMetrics[key][prop] = +matrix[key].rate
	}
	return taskMetrics
}

module.exports = {
	getRelativeQuantity,
	getMemoqMetrics,
	setTaskMetrics,
	getMemoqMetricsForUndefinedDocuments
}