export default {
	methods: {
		getClientLanguagesByServices(languageType) {
			if (this.currentProject._id) {
				if (this.tasksData.hasOwnProperty('service')) {
					const {_id} = this.tasksData.service;
					const neededServices = this.currentProject.customer.services
						.filter(item => item.services[0] === _id)
						.map(item => languageType === 'sourceLanguage' ? item[languageType] : item[languageType][0]);

					return this.originallyLanguages.filter(a => {
						return [...new Set(neededServices)].some(b => {
							return a._id.toString() === b
						})
					})
				}
			}
		}
	},
}