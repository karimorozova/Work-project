import { mapActions } from "vuex"

export default {
	methods: {
		...mapActions({
			getServices: "getServices",
			alertToggle: "alertToggle",
			setTasksDataValue: "setTasksDataValue"
		}),
		isActiveStepInRates(stepId) {
			const { customer: { rates: { stepMultipliersTable } } } = this.currentProject
			const stepRates = stepMultipliersTable.filter(({ step }) => `${ step }` === `${ stepId }`)
			return stepRates.some(({ isActive }) => isActive)
		},
		currentClientServices() {
			const { industry, customer: { services, rates: { stepMultipliersTable } } } = this.currentProject
			const arrayOfClientServices = [ ...new Set(
					services
							.filter(({ industries }) => industries[0] === industry._id)
							.map(({ services }) => services).flat()
			) ]

			const clientServices = this.services.filter((a) => arrayOfClientServices.some((b) => a._id.toString() === b))

			let finalServicesArr = []
			clientServices.forEach(elem => {
				if (elem.steps.length) {
					const stepsIds = [ ...elem.steps ].map(i => `${ i.step._id }`)
					const stepRates = stepMultipliersTable.filter(({ step }) => stepsIds.includes(`${ step }`))
					if (stepRates.length) {
						if (!stepRates.every(({ isActive }) => !isActive)) {
							finalServicesArr.push(elem)
						}
					}
				}
			})
			return finalServicesArr
		},

		setDefaultLanguages({ languageForm }) {
			const [ language ] = this.getClientLanguagesByServices('sourceLanguage')
			const { symbol } = language
			if (languageForm === 'Duo') {
				this.$emit("setSourceLanguage", { symbol })
			} else {
				this.$emit("setTargets", { targets: [ language ] })
				this.$emit("setSourceLanguage", { symbol })
			}
		},
		setDefaultService() {


			const service = this.currentClientServices().find(i => i)
			if (!service.steps.length) return this.showError()

			const { steps, title } = service
			this.service = title

			let countStepsInService = steps.length === 2 && (this.isActiveStepInRates(steps[0].step._id) && this.isActiveStepInRates(steps[1].step._id))
					? "2 Steps"
					: "1 Step"

			this.setDataValue({ prop: "service", value: service })
			this.setWorkflow({ option: countStepsInService })
			this.setDefaultLanguages(service)
		}
	},
	created() {
		this.setDefaultService()
	}
}
