const { MemoqProject, Languages, LangTier } = require('../models');
const { findLanguageByMemoqLanguageCode } = require('../helpers/commonFunctions');
const { fillLangTierReportWithLocal } = require('../projects/langTierReport');
const moment = require('moment');

/**
 *
 * @returns nothing - cleans old collection and fills it with new data
 */
const newLangReport = async () => {

  const languages = await Languages.find();
  // const dateStartNovember = "2020-11-01"
  // const dateEndNovember = "2020-11-30"

  const date4MonthAgo = moment().subtract(4, 'months').format('YYYY-MM-DD');
  const today = moment().format('YYYY-MM-DD');
  let projects = await MemoqProject.find({ $and: [{ status: 'Closed' }, { isTest: false }, {deadline: {$gte: date4MonthAgo}}, {deadline: {$lte: today}}] });

  projects = projects.filter(item => item.sourceLanguage);
  const reports = [];
  for (let { domain, sourceLanguage, documents } of projects) {
    const industryGroup = findIndustry(domain);
    industryGroup && sourceLanguage && distributeIndustries(industryGroup, sourceLanguage, documents);
    distributeIndustries('All', sourceLanguage, documents);
  }

  function distributeIndustries (industryKey, sourceLanguage, documents) {
    const doesIndustryExists = reports.find(row => row.industry === industryKey);
    if(doesIndustryExists === undefined) {
      reports.push({
        industry: industryKey,
        source: [returnSourceObj(languages, sourceLanguage.memoq, 1, documents)]
      });
    } else {
      const neededReport = reports.findIndex(item => item.industry === industryKey);

      const sameSourceIndex = reports[neededReport].source.findIndex(({ lang }) => (
        lang === findLanguageGroup(languages, sourceLanguage.memoq
        )));

      if(sameSourceIndex === -1) {
        reports[neededReport].source.push(returnSourceObj(languages, sourceLanguage.memoq, 1, documents));
      } else {
        reports[neededReport].source[sameSourceIndex].targets.push(...findAllTargets(documents));
      }
    }
  }

  await LangTier.deleteMany();
  await postReports();
  await fillLangTierReportWithLocal();
  await calculateWordcount()

  async function postReports() {
    const result = [];
    for (let report of reports) {
      const { source } = report;
      report.source = source.map(item => {
        let unitedTargets = [];
        for (let { lang, wordcount } of item.targets) {
          const sameTargetIndex = unitedTargets.findIndex(row => row.lang === lang);
          if(sameTargetIndex !== -1) {
            unitedTargets[sameTargetIndex].wordcount += wordcount;
          } else {
            unitedTargets.push({
              lang,
              wordcount
            });
          }
        }
        item.targets = unitedTargets;
        return item;
      });
      result.push(report);
    }
    await LangTier.create(result);
  }

  function returnSourceObj (languages, source, client, targets) {
    return { lang: findLanguageGroup(languages, source), clients: client, targets: findAllTargets(targets) };
  }

  function findLanguageGroup (allLanguages, memoqSymbol) {
    let language = allLanguages.find(lang => {
      return findLanguageByMemoqLanguageCode(lang, memoqSymbol);
    });
    return language ? language.group : memoqSymbol;
    // return language ? language.lang : memoqSymbol;
  }

  function findAllTargets (documents) {
    return documents.map(({ TargetLangCode, WeightedWords }) => (
      {
        lang: findLanguageGroup(languages, TargetLangCode),
        wordcount: +WeightedWords
      }
    ));
  }

  async function calculateWordcount() {
    const tierInfo = await LangTier.find()

    for (let langTierReport of tierInfo) {
      const { industry, source: sources } = langTierReport

      for( let source of sources) {
        for( let target of source.targets){
          target.tier = getIndustryTier(industryTierInfo, industry, target.wordcount)
        }
      }
    }

    await LangTier.create(tierInfo)

    function getIndustryTier(industryTierInfo, industry, wordcount) {

      let tiers
      if (industry === 'All') {
        tiers = industryTierInfo.find(industryTier => industryTier.industry === null)
      } else {
        tiers = industryTierInfo.filter(industryTier => industryTier.industry !== null).find(industryTier => industryTier.industry.name === industry)
      }
      if ((tiers.tier1*4) > wordcount && (tiers.tier3*4) < wordcount) return 2
      if ((tiers.tier3*4) > wordcount) return 3
      return 1
    }
  }

};

const findIndustry = (domain) => {
  switch (domain) {
    case 'Poker':
    case 'eSport':
    case 'iGaming':
    case 'iGaming (Casino, Slot games, Gambling, etc.)':
    case 'Video Games':
    case 'Lottery':
      return 'iGaming';
    case 'CFDs and Online Trading':
    case 'ICOs & Cryptocurrency':
    case 'Forex':
    case 'ICO':
    case 'Finance':
      return 'Finance';
  }
};

module.exports = { newLangReport, findIndustry };

