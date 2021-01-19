export default {
	methods: {
		getClientLanguagesByServices(languageType) {
			if (this.currentProject._id && this.tasksData.hasOwnProperty("service")) {
				const { customer: { services }, industry } = this.currentProject
				const { service } = this.tasksData

				const neededServices = services
						.filter(
								item =>
										item.services[0] === service._id &&
										item.industries[0] === industry._id
						)
						.map(item =>
								languageType === "sourceLanguage"
										? item[languageType]
										: item[languageType][0]
						)

				return this.originallyLanguages.filter(a => {
					return [...new Set(neededServices)].some(b => {
						return a._id.toString() === b
					})
				})
			}
		}
	}
}
