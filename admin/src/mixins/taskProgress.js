export default {
	methods: {
		progress(task) {
			let progress = 0
			const { _id: catId } = this.originallyUnits.find(({ type }) => type === 'CAT Wordcount')
			const CATServices = this.originallyServices
					.filter(({ steps }) => steps.some(({ step: { calculationUnit } }) => calculationUnit.includes(catId)))
					.map(({ title }) => title)

			let taskSteps = this.currentProject.steps.filter(item => item.taskId === task.taskId)
			taskSteps = taskSteps.filter(item => !item.stepId.includes('Cancelled'))
			if (CATServices.includes(task.service.title)) {
				const [ firstStep, secondStep ] = taskSteps
				if (taskSteps.length === 2) {
					if (isObject(secondStep.progress) && isObject(firstStep.progress)) {
						const firstStepProgress = calculatePercentage(firstStep)
						const secondStepProgress = calculatePercentage(secondStep)
						progress = (firstStepProgress + secondStepProgress) / 2
					}
				} else if (taskSteps.length === 1) {
					progress = calculatePercentage(firstStep)
				}
			} else {
				progress = taskSteps.reduce((init, cur) => init + cur.progress / taskSteps.length, 0)
			}

			function isObject(key) {
				return typeof key === "object"
			}

			function calculatePercentage(step) {
				return (+step.progress.wordsDone / +step.progress.totalWordCount) * 100
			}

			return progress.toFixed(2)
		},
	}
}