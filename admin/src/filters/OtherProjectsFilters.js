import Vue from "vue";

Vue.filter("otherProjectsTaskStatus", (str) => {
	switch (str) {
		case 'TranslationFinished':
			return 'Completed';
		case 'TranslationInProgress':
			return 'In progress'
		default:
			return str
	}
});

Vue.filter("otherProjectsIndustryFilter", (str) => {
		return str
});