const { MemoqProject, Industries, Languages } = require('../models');

const newLangReport = async () => {
	// const finance = ["Poker", "eSport", "iGaming", "Video Games"];
	// const gaming = ['CFDs & Online Trading', 'ICOs & Cryptocurrency', 'Finance'];
	// const financeIndustries = await Industries.find({ name: { $in: finance } });
	// const gameIndustries = await Industries.find({ name: { $in: gaming } });

	const languages = await Languages.find();
	const projects = await MemoqProject.find({ status: 'Closed' });
	const reports = [];
	for (let { domain, sourceLanguage, documents } of projects) {

		const industryGroup = findIndustry(domain);
		const doesIndustryExists = reports.find(row => row.industry === industryGroup);

		if(!doesIndustryExists) {
			reports.push({ industry: industryGroup, source: [returnSourceObj(languages, sourceLanguage.memoq, 1, documents)] });
		} else {
			const neededReport = reports.findIndex(item => item.industry === industryGroup);
			const sameSourceIndex = reports[neededReport].source.findIndex(({ lang }) => lang === findLanguageGroup(languages, sourceLanguage.memoq));

			sameSourceIndex === -1 ?
					reports[neededReport].source.push(returnSourceObj(languages, sourceLanguage.memoq, 1, documents)) :
					reports[neededReport].source[sameSourceIndex].targets.push({ targets: findAllTargets(documents) })
		}
	}

	console.log(reports);

	function returnSourceObj(languages, source, client, targets) {
		return { lang: findLanguageGroup(languages, source), clients: client, targets: findAllTargets(targets) }
	}

	// function findIndustry(industry) {
	// 	const isFinance = finance.includes(industry);
	// 	const isIGaming = gaming.includes(industry);
	// 	if(isFinance) return 'Finance';
	// 	if(isIGaming) return 'iGaming';
	// 	return 'All';
	// }

	function findLanguageGroup(allLanguages, memoqSymbol) {
		return allLanguages.find(lang => lang.memoq === memoqSymbol) ? allLanguages.find(lang => lang.memoq === memoqSymbol).group : 'TEST';
	}

	function findAllTargets(documents) {
		return documents.map(({ TargetLangCode, TotalWordCount }) => (
				{
					lang: findLanguageGroup(languages, TargetLangCode),
					wordcount: TotalWordCount
				}
		))
	}

	function findIndustry(domain) {
		switch (domain) {
			case 'Poker':
			case 'eSport':
			case 'iGaming':
			case 'Video Games':
				return 'iGaming';
			case 'CFDs & Online Trading':
			case 'ICOs & Cryptocurrency':
			case 'Finance':
				return 'Finance';
			default:
				return 'All';
		}
	}
}

module.exports = { newLangReport }

