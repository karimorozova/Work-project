const { LangTier, Projects, Languages } = require('../models');
const { langTierIndustries } = require('../enums');

const fillLangTierReportWithLocal = async () => {
  const finishedProjects = await Projects.find({
    $and: [
      { status: 'Closed' }, { 'tasks.service.title': 'Translation' }, { isTest: false }
    ]
  }).populate('industry', ['name']);
  const langTierReports = await LangTier.find();
  const localLanguages = await Languages.find();
  for (let { tasks, industry } of finishedProjects) {
    if (industry.name === langTierIndustries.iGaming) {
      const iGamingReportIndex = langTierReports.findIndex(({ industry }) => industry === 'iGaming');
      for (let { finance, sourceLanguage, targetLanguage } of tasks) {
        const neededReport = langTierReports[iGamingReportIndex];
        const taskSourceLanguageName = localLanguages.find(({ symbol }) => symbol === sourceLanguage);
        const taskTargetLanguageName = localLanguages.find(({ symbol }) => symbol === targetLanguage);
        const sameSourceIndex = neededReport.findIndex(item => {
          return item.source === taskSourceLanguageName.group;
        });
        if (sameSourceIndex !== -1) {
          const { targets } = neededReport.source[sameSourceIndex];
          const sameTargetIndex = targets.findIndex(item => {
            return item.lang === taskTargetLanguageName.group;
          });
          if (sameTargetIndex !== -1) {
            targets[sameTargetIndex].wordcount += finance.Wordcount.receivables;
          } else {
            neededReport.source[sameSourceIndex].targets.push({
              wordcount: finance.Wordcount.receivables,
              lang: taskTargetLanguageName.group
            });
          }
        } else {
          neededReport.source.push({
            clients: 1,
            lang: taskSourceLanguageName.group,
            targets: [{ wordcount: finance.Wordcount.receivables, lang: taskTargetLanguageName.group }]
          });
        }
      }
    }
  }
};

module.exports = { fillLangTierReportWithLocal };
