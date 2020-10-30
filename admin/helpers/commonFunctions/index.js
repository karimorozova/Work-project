const  findLanguageByMemoqLanguageCode = (lang, memoqSymbol) => {
	memoqSymbol === 'spa-PE' && (memoqSymbol = 'spa-ES');
	if(lang.memoq === memoqSymbol) return true;
	else if(lang.xtm === memoqSymbol) return true;
	else if(lang.iso1 === memoqSymbol) return true;
	else if(lang.iso2 === memoqSymbol) return true;
};

module.exports = {
	findLanguageByMemoqLanguageCode,
}