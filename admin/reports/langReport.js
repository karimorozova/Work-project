const { MemoqProject, Languages, Industries, LangTier } = require('../models');

async function getLangReports() {
  try {
    const currentDate = new Date();
    const projects = await MemoqProject.find();
    const languages = await Languages.find();
    const industriesNames = [...new Set(projects.map(project => project.domain))];
    for (industry of industriesNames) {
      const langs = getLanguageData(projects, languages, industry);
      await LangTier.updateOne({ industry }, { languages: langs, updatedAt: currentDate }, { upsert: true });
    }
  } catch (err) {
    console.log(err);
    console.log('Error in getLangReports');
  }
}

function getLanguageData(projects, languages, industry) {
  const filteredProjects = projects.filter(project => project.domain === industry);
  let result = {};
  for (let { lang } of languages) {
    const clientsData = filteredProjects.reduce((acc, cur) => {
      if (!!cur.targetLanguages.find(item => item.lang === lang)) {
        const key = cur.client.replace(/\./g,' ');
        acc[key] = acc[key] ?
          acc[key] + +cur.totalWordCount
          : +cur.totalWordCount;
      }
      return acc;
    }, {});
    if (Object.keys(clientsData).length) {
      result[lang] = clientsData;
    }
  }
  return result;
}

module.exports = {
  getLangReports
}
