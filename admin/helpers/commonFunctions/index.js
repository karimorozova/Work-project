const findLanguageByMemoqLanguageCode = (lang, memoqSymbol) => {
	switch (memoqSymbol) {
		case 'spa-PE':
		case 'spa':
			memoqSymbol = 'spa-ES';
			break
	}
	if(lang.memoq === memoqSymbol) return true;
	else if(lang.xtm === memoqSymbol) return true;
	else if(lang.iso1 === memoqSymbol) return true;
	else if(lang.iso2 === memoqSymbol) return true;
	else if(lang.symbol === memoqSymbol) return true;
};

const getUniqueLanguagePairsByTasks = (tasks) => {
	return [
		...new Set(
				tasks.reduce((acc, curr) => {
					acc.push(`${ curr.sourceLanguage } >> ${ curr.targetLanguage }`);
					return acc;
				}, [])
		)]
};

const getUniqueServicesBySteps = (steps) => {
	return [
		...new Set(
				steps.map(({ serviceStep }) => serviceStep.title)
		)]
};

module.exports = {
	findLanguageByMemoqLanguageCode,
	getUniqueLanguagePairsByTasks,
	getUniqueServicesBySteps
};
