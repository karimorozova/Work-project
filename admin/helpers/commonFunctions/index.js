const findLanguageByMemoqLanguageCode = (lang, memoqSymbol) => {
	switch (memoqSymbol) {
		case 'spa-PE':
		case 'spa':
			memoqSymbol = 'spa-ES'
			break
	}
	if (lang.memoq === memoqSymbol) return true
	else if (lang.xtm === memoqSymbol) return true
	else if (lang.iso1 === memoqSymbol) return true
	else if (lang.iso2 === memoqSymbol) return true
	else if (lang.symbol === memoqSymbol) return true
}

function calculateCrossRate(USD, GBP) {
	const EUR = 1;
	return {
		EUR: { EUR, USD, GBP },
		USD: {
			USD: 1,
			EUR: dividedValue(EUR, USD),
			GBP: dividedValue(GBP, USD),
		},
		GBP: {
			GBP: 1,
			EUR: dividedValue(EUR, GBP),
			USD: dividedValue(USD, GBP),
		}
	};

	function dividedValue(A, B) {
		return +(A / B).toFixed(2);
	}
}

const rateExchangeVendorOntoProject = (projectCurrency, vendorCurrency, nativeRate, crossRateTable) => {
	return +(nativeRate * crossRateTable[vendorCurrency][projectCurrency]).toFixed(4)
}

const rateExchangeProjectOntoVendor = (projectCurrency, vendorCurrency, nativeRate, crossRateTable) => {
	return +(nativeRate * crossRateTable[projectCurrency][vendorCurrency]).toFixed(4)
}

const returnIconCurrencyByStringCode = (currencyStingCode) => {
	switch (currencyStingCode) {
		case "EUR":
			return "&nbsp;&euro;&nbsp;"
		case "USD":
			return "&nbsp;&#36;&nbsp;"
		case "GBP":
			return "&nbsp;&pound;&nbsp;"
		default:
			return "&nbsp;&euro;&nbsp;"
	}
}

const getUniqueLanguagePairsByTasks = (tasks) => {
	return [
		...new Set(
				tasks.reduce((acc, curr) => {
					acc.push(`${ curr.sourceLanguage } >> ${ curr.targetLanguage }`)
					return acc
				}, [])
		)]
}

const getUniqueServicesBySteps = (steps) => {
	return [
		...new Set(
				steps.map(({ serviceStep }) => serviceStep.title)
		)]
}

module.exports = {
	findLanguageByMemoqLanguageCode,
	getUniqueLanguagePairsByTasks,
	getUniqueServicesBySteps,
	returnIconCurrencyByStringCode,
	rateExchangeVendorOntoProject,
	rateExchangeProjectOntoVendor,
	calculateCrossRate

}
