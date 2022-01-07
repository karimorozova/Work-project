import Vue from "vue";

Vue.filter("otherProjectsTaskStatus", (str) => {
	switch (str) {
		case 'TranslationFinished':
		case 'ProofreadingFinished':
      return 'Completed';
    case 'TranslationInProgress':
      return 'In progress';
    default:
      return str;
	}
});

Vue.filter("otherProjectsIndustryFilter", (str) => {
	switch (str) {
		case 'Sport-Betting':
			return 'Sports Betting';
		case 'Hotel and Real Estates':
			return 'Real Estate';
		case 'iGaming':
		case 'iGaming (Casino, Slot games, Gambling, etc.)':
			return 'iGaming';
		case 'CFDs and Online Trading':
			return 'CFDs & Online Trading';
		case 'E-Learning':
		case 'eLearning':
			return 'E-Learning';
		case 'Medicine':
			return 'Medical Devices';
		case 'IT':
			return 'Websites, Apps & Platforms';
		default:
			return str
	}
});

Vue.filter("roundWordCount", (str) => {
  return Math.round(+str)
});

Vue.filter("roundTwoDigit", (num) => {
	return +(+num).toFixed(2)
});
