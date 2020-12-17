const { findIndustry } = require("./newLangTierReport");
const { XtrfLqa, Projects, Industries, Languages } = require('../models')
const { getTier } = require('./newLQAStatusReport')
const _ = require('lodash')
const { ObjectId } = require('mongodb')

async function UpdateLQAFromProject () {

  const projects = await Projects
                          .find({$and: [{status: 'Closed'}, {isTest: {$ne: true}}, {isInLQAReports: {$ne: true}}]})
                          .populate('industry')
                          .populate('steps.serviceStep.unit')
                          .populate( 'steps.vendor')

  const allIndustries = await Industries.find()
  const otherIndustry = await Industries.findOne({name: "Other"})
  const allLanguages = await Languages.find()
  const allXtrfLqa = await XtrfLqa.find()
  let results = projects.reduce((result, project) => {
    result = !result.length ? allXtrfLqa.length ? allXtrfLqa : []  : result
    console.log(result);

    const { industry , steps } = project

    const projectIndustry =  findOrDefault(allIndustries, {name: industry.name}, otherIndustry);
    const projectIndustryGroup =  findOrDefault(allIndustries, {name: findIndustry(industry.name)}, otherIndustry);

    steps.forEach(step => {
      const {sourceLanguage, targetLanguage, vendor, totalWords, serviceStep: { title , unit: {type}}} = step;

      if (type !== 'CAT Wordcount' || title !== 'Translation') return;

      const projectSourceLang = findOrDefault(allLanguages, {symbol: sourceLanguage}, {_id: null, lang: 'No Data'});
      const projectTargetLang = findOrDefault(allLanguages, {symbol: targetLanguage}, {_id: null, lang: 'No Data'});

      const languagePair = projectSourceLang.lang + " >> " + projectTargetLang.lang

      const findLangPairId = _.findIndex(result, {languagePair});
      console.log(findLangPairId)

      const userInfo = {
        name: vendor.firstName,
        vendor: vendor.id,
        email: vendor.email,
        wordCount: totalWords,
        tier: getTier(industry.name, totalWords)
      }

      const industriesInfo =  {
        industry: ObjectId(projectIndustry._id),
        industryGroup: ObjectId(projectIndustryGroup._id),
        vendors: [userInfo]
      }

      if (findLangPairId < 0) {
        result.push({
          languagePair,
          sourceLanguage: ObjectId(projectSourceLang._id),
          targetLanguage: ObjectId(projectTargetLang._id),
          industries: [ industriesInfo ]

        })
        return;
      }


      const indexIndustry = _.findIndex(result[findLangPairId].industries, {industry: projectIndustry._id})

      if (indexIndustry < 0 ) {
        result[findLangPairId].industries.push(industriesInfo)
        return;
      }

      const indexVendor = _.findIndex(result[findLangPairId].industries[indexIndustry].vendors, {name: vendor.firstName});

      if (indexVendor < 0) {
        result[findLangPairId].industries[indexIndustry].vendors.push(userInfo);
        return;
      }

      const wordCount = result[findLangPairId].industries[indexIndustry].vendors[indexVendor].wordCount;
      result[findLangPairId].industries[indexIndustry].vendors[indexVendor].wordCount = +wordCount + +totalWords;
      result[findLangPairId].industries[indexIndustry].vendors[indexVendor].tier = getTier(projectIndustryGroup.name, wordCount);


    })

    return result
  },[])
  // console.log(results)
  // let b = [{
  //   languagePair: "test",
  //   sourceLanguage:null,
  //   targetLanguage: null,
  //   industries: [  ]
  //
  // }]
  // await XtrfLqa.updateMany({}, {$set: b}, {multi: true})

  // await  XtrfLqa.updateMany({}, {results})

  // for (let result of results) {
  //   let a = await XtrfLqa.findOneAndUpdate({languagePair: result.languagePair},{result})
  //   if(!a)
  //     await new XtrfLqa(result).save()
  // }
  for(let result of results) {
    await new XtrfLqa(result).save()
  }
  // await  XtrfLqa.save(...results)


  await Projects.updateMany({$and: [{status: 'Closed'}, {isTest: {$ne: true}}, {isInLQAReports: {$ne: true}}]}, {isInLQAReports: true})

  function findOrDefault(obj, search, defaultValue) {
    return _.find(obj, search) || defaultValue
  }
}

module.exports = {
  UpdateLQAFromProject
}
