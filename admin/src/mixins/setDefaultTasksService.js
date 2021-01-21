import { mapActions } from "vuex"

export default {
	methods: {
		...mapActions({
			getServices: "getServices",
			alertToggle: "alertToggle",
			setTasksDataValue: "setTasksDataValue"
		}),
		currentClientServices() {
			const { industry, customer: { services } } = this.currentProject
			const arrayOfClientServices = [
				...new Set(
						services
								.filter(({ industries }) => industries[0] === industry._id)
								.map(({ services }) => services).flat()
				)
			]
			return this.services.filter((a) => arrayOfClientServices.some((b) => a._id.toString() === b)
			)
		},
		setDefaultLanguages({ languageForm }) {
			const [language] = this.getClientLanguagesByServices('sourceLanguage')
			const { symbol } = language
			if (languageForm === 'Duo') {
				this.$emit("setSourceLanguage", { symbol })
			} else {
				this.$emit("setTargets", { targets: [language] })
				this.$emit("setSourceLanguage", { symbol })
			}
		},
		setDefaultService() {
			const service = this.currentClientServices().find(i => i)
			this.service = service.title
			if (!service.steps.length) return this.showError()
			this.setDataValue({ prop: "service", value: service })
			const countStepsInService = service.steps.length === 1 ? "1 Step" : "2 Steps"
			this.setWorkflow({ option: countStepsInService })
			this.setDefaultLanguages(service)
		}
	},
	created() {
		this.setDefaultService()
	}
}
