const { LangTier, Projects, Languages } = require('../models');

const fillLangTierReportWithLocal = async () => {
  const date = new Date();
  const sixMonthsAgo = new Date(date.setMonth(date.getMonth() - 6)).toISOString();
  let finishedProjects = await Projects.find({
    $and: [
      { status: 'Closed' },
      { isTest: false },
      { startDate: { '$gte': sixMonthsAgo } }
    ]
  }).populate('industry', ['name']);
  const langTierReports = await LangTier.find();
  const localLanguages = await Languages.find();

  finishedProjects = finishedProjects.filter(({ industry }) => industry.name === 'iGaming' || industry.name === 'Finance');
  for (let { steps, industry } of finishedProjects) {
    const reportIndex = langTierReports.findIndex(i => i.industry === industry.name);
    const reportAllIndex = langTierReports.findIndex(i => i.industry === 'All');
    if (reportIndex !== -1) {
      steps = steps.filter(i => i.name === 'Translation');
      for (const { sourceLanguage, targetLanguage, finance } of steps) {
        recalculateWordcount(reportIndex, sourceLanguage, targetLanguage, finance);
        recalculateWordcount(reportAllIndex, sourceLanguage, targetLanguage, finance);

      }
    }

    for (let report of langTierReports) await LangTier.updateOne({ _id: report._id }, report);

    function recalculateWordcount (reportIndex, sourceLanguage, targetLanguage, finance) {
      const source = localLanguages.find(({ symbol }) => symbol === sourceLanguage);
      const target = localLanguages.find(({ symbol }) => symbol === targetLanguage);
      const sameSourceIndex = langTierReports[reportIndex].source.findIndex(i => i.lang === source.group);
      if (sameSourceIndex === -1) {
        langTierReports[reportIndex].source.push({
          lang: source.group,
          targets: [{ wordcount: finance.Wordcount.receivables, lang: target.group }]
        });
      } else {
        const sameTargetIndex = langTierReports[reportIndex].source[sameSourceIndex].targets.findIndex(i => (
          i.lang === target.group
        ));
        if (sameTargetIndex === -1) {
          langTierReports[reportIndex].source[sameSourceIndex].targets.push(
            { wordcount: finance.Wordcount.receivables, lang: target.group });
        } else {
          langTierReports[reportIndex].source[sameSourceIndex].targets[sameTargetIndex].wordcount += finance.Wordcount.receivables;
        }
      }
    }
  }
};

module.exports = { fillLangTierReportWithLocal };
