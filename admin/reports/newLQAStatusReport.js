const {MemoqProject, Languages, XtrfLqa} = require('../models');
const {findIndustry} = require('./newLangTierReport')
const {findLanguageByMemoqLanguageCode} = require('../helpers/commonFunctions');
const _ = require('lodash')
const newLQAStatusReport = async () => {

  const categories = [
    'Finance',
    'iGaming'
  ];

  let projects = await MemoqProject.find({isInLQAReports: {$ne: true}});
  let reports = await XtrfLqa.find()
  const languages = await Languages.find();

  projects = projects.filter((project) => categories.includes(findIndustry(project.domain)))
  for (project of projects) {
    if (!project) {
      continue;
    }

    let {domain,serverProjectGuid , documents, sourceLanguage} = project;
    const industry = findIndustry(project.domain)
    await MemoqProject.findOneAndUpdate({serverProjectGuid}, {isInLQAReports: true})

    for ({
      TotalWordCount,
      TargetLangCode,
      UserAssignments: {TranslationDocumentUserRoleAssignmentDetails: users}
    } of documents) {
      let targetLanguage = getLanguageByMemoqLangCode(languages, TargetLangCode) ? getLanguageByMemoqLangCode(languages, TargetLangCode) : TargetLangCode;
      // let targetLanguage = getLanguageByMemoqLangCode(languages, TargetLangCode) || TargetLangCode;

      const user = _.filter(users, (user) => user.DocumentAssignmentRole === '0').shift();

      if (!user || !targetLanguage) {
        continue;
      }

      const languagePair = sourceLanguage.lang + " >> " + targetLanguage.lang;
      const index = _.findIndex(reports, {languagePair});

      if (index < 0) {
        const userInfo = {
          name: user.UserInfoHeader.FullName,
          wordCount: TotalWordCount,
          tier: getTier(domain, TotalWordCount)
        }
        reports.push({
          languagePair,
          sourceLanguage: sourceLanguage._id,
          targetLanguage: targetLanguage._id,
          industries: {
            Finance: {
              vendors: industry === 'Finance' ? [userInfo] : []
            },
            iGaming: {
              vendors: industry === 'iGaming' ? [userInfo] : []
            }
          }
        })

      } else {

        const indexVendor = _.findIndex(reports[index].industries[industry].vendors, {name: user.UserInfoHeader.FullName});

        if (indexVendor < 0) {
          reports[index].industries[industry].vendors.push({
            name: user.UserInfoHeader.FullName,
            wordCount: TotalWordCount,
            tier: getTier(industry, TotalWordCount)
          });
        } else {
          const wordCount = reports[index].industries[industry].vendors[indexVendor].wordCount;
          reports[index].industries[industry].vendors[indexVendor].wordCount = +wordCount + +TotalWordCount;
          reports[index].industries[industry].vendors[indexVendor].tier = getTier(industry, wordCount);

        }
      }
    }
  }
  for (let report of reports) {
    await new XtrfLqa(report).save();
  }
  return await XtrfLqa.find().populate('sourceLanguage', 'lang').populate('targetLanguage','lang');
}

function getTier(industry, worldCount) {
  const tierValues = {max: 30000, min: 5000}

  switch (true) {
    case tierValues.max < +worldCount:
      return 1;
      break;
    case tierValues.min > +worldCount:
      return 3;
      break;
    default:
      return 2;
      break;
  }
}

function getLanguageByMemoqLangCode(languages, TargetLangCode) {
  return languages.find(lang => {
    return findLanguageByMemoqLanguageCode(lang, TargetLangCode);
  });
}

module.exports = {
  newLQAStatusReport
}
