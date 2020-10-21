const { MemoqProject, Industries, Languages } = require('../models');

const newLangReport = async () => {
  const finance = ["Poker", "eSport", "iGaming", "Video Games"];
  const gaming = ['CFDs & Online Trading', 'ICOs & Cryptocurrency', 'Finance'];
  const financeIndustries = await Industries.find({name: {$in: finance}});
  const gameIndustries = await Industries.find({name: {$in: gaming}});
  const languages = await Languages.find();
  const projects = await MemoqProject.find({ status: 'Closed' }).populate('industry', ['name']);
  const reports = [];
  for (let { industry, sourceLanguage, documents } of projects) {
    const industryGroup = findIndustry(industry);
    const doesIndustryExists = reports.find(row => row.industry === industryGroup);
    if (!doesIndustryExists) {
      reports.push({
        industry: industryGroup,
        source: [{
          lang: findLanguageGroup(languages, sourceLanguage.memoq),
          clients: 1,
          targets: findAllTargets(documents)
        }]
      });
    } else {
      const neededReport = reports.find(item => item.industry === industryGroup);
      const sameSourceIndex = neededReport.source.findIndex(({ lang }) => lang === findLanguageGroup(languages, sourceLanguage.memoq));
      if (sameSourceIndex !== -1) {
        const newTargets = findAllTargets(documents);
        neededReport.source[sameSourceIndex].target.push(...newTargets);
        // neededReport.source[sameSourceIndex].c
      } else {

      }
    }
  }

  function findIndustry(industry) {
    const isFinance = finance.includes(industry.name);
    const isIGaming = gaming.includes(industry.name);
    if (isFinance) return 'Finance';
    if (isIGaming) return 'iGaming';
    return 'All';
  }

  function findLanguageGroup(allLanguages, memoqSymbol) {
    return allLanguages.find(lang => lang.memoq === memoqSymbol).group;
  }

  function findAllTargets(documents) {
    return documents.map(({ TargetLangCode, TotalWordCount }) => (
      {
        lang: findLanguageGroup(languages, TargetLangCode),
        wordcount: TotalWordCount
      }
    ))
  }
}

