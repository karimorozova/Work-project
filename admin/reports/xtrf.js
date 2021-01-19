const { Languages, XtrfLqa, Vendor, Step,XtrfLqaGrouped} = require('../models');
const {
  getFilteringQueryForLqaReport,
  getVendorsData,
  getTierFromWordcount,
  personalFlat,
  canNextLQAStep
} = require('./helpers');

//// Tier report ////
/**
 *
 * @param {Array} reports
 * @returns {Array} - returns filled array of tier reports
 */
const rebuildTierReportsStructure = (reports) => {
  try {
    let languagesArray = [];
    let result = [];
    reports.forEach(indArr => {
      const { industry } = indArr;
      const objName = industry === 'iGaming' ? 'gameTier' : industry === 'Finance' ? 'financeTier' : 'allTier';
      const languages = indArr.source.reduce((acc, curr) => {
        acc.push(curr.targets.map(target => {
          const sameLangsPairs = personalFlat(languagesArray)
            .findIndex(item => item.source === curr.lang && item.target === target.lang);
          const industryObj = {
            [objName]: {
              tier: getTierFromWordcount(Math.ceil(target.wordcount / 4), objName, curr.clients),
              wordcount: Math.ceil(target.wordcount / 4),
              clients: curr.clients
            }
          };
          const structureObject = {
            source: curr.lang,
            target: target.lang,
            ...industryObj
          };
          return sameLangsPairs === -1 ? structureObject :
            Object.assign(personalFlat(languagesArray)[sameLangsPairs], industryObj);
        }));
        return acc;
      }, []);
      languagesArray.push(...languages);
    });

    personalFlat(languagesArray).forEach(languages => {
      const sampleLangPair = result.findIndex(item => (
        `${item.source}-${item.target}` === `${languages.source}-${languages.target}`
      ));
      sampleLangPair === -1 && result.push(languages);
    });

    return result;
  } catch (err) {
    console.log(err);
    console.log('Error in rebuildTierReportsStructure');
  }
};


//// Lqa report /////
/**
 *
 * @param {Object} filters
 * @returns {Array} - returns array of xtrf lqa reports
 */
const getXtrfLqaReport = async (filters) => {
  let { sourceFilter, targetFilter, vendorFilter, countFilter, skipCount, tierFilter, industryFilter } = filters;
  const languages = await Languages.find();
  const step = await Step.findOne({title: 'Translation'},{title: 1})
  const filterQuery = await getFilteringQueryForLqaReport(filters, languages);
  countFilter = (sourceFilter || targetFilter || vendorFilter) ? 0 : countFilter;
  skipCount = (sourceFilter || targetFilter || vendorFilter) ? 0 : skipCount;
  const dataLimitQuery = { 'industries.vendors.otherInfo': 0 };
  try {
    let result = [];
    const xtrfLqaReport = await getReport();
    for (let { sourceLanguage, targetLanguage, industries, languagePair } of xtrfLqaReport) {
      sourceLanguage = sourceLanguage ? sourceLanguage.lang : 'no language data';
      targetLanguage = targetLanguage ? targetLanguage.lang : 'no language data';
      result.push({
        languagePair,
        sourceLanguage,
        targetLanguage,
        industries,
        step,
      });
    }


    if (sourceFilter) {
      result = result.filter(({ sourceLanguage }) => sourceLanguage === sourceFilter);
    }

    if (targetFilter) {
      result = result.filter(({ targetLanguage }) => targetLanguage === targetFilter);
    }

    if (vendorFilter) {
      result = result.map(row => {
        row.industries =  row.industries.map((industry) =>  {
          industry.vendors = industry.vendors.filter(({ name }) => name === vendorFilter)
          return industry
        }).filter(({vendors})=> vendors.length)
        return row;
      });
    }
    if (tierFilter) {
      result = result.filter(({ industries }) => {
        const { Finance, iGaming } = industries;
        const { vendors: financeVendors } = Finance;
        const { vendors: igamingVendors } = iGaming;
        Finance.vendors = financeVendors.filter(vendor => vendor.tier === +tierFilter);
        iGaming.vendors = igamingVendors.filter(vendor => vendor.tier === +tierFilter);
        return industries;
      });
    }
    if (industryFilter) {
      if (industryFilter !== 'All') {
        result = result.map(item => {
          item.industries =  item.industries.filter(({industryGroup}) => {
            // console.log({indN: industryGroup.name, industryFilter})
            return industryGroup.name === industryFilter
          } );
          return item
        });
      }
    }
    return result.filter(({industries})=> industries.length);
  } catch (err) {
    console.log(err);
    console.log('Error in getXtrfLqaReport');
  }

  /**
   *
   * @returns {Array} returns report with populated(filled from other collections) data
   */
  async function getReport() {
    return await XtrfLqaGrouped.find(filterQuery ,dataLimitQuery).skip(skipCount).limit(countFilter)
      .populate('sourceLanguage', ['lang'])
      .populate('targetLanguage', ['lang'])
      .populate('industries.industry', ['name'])
      .populate('industries.vendors.vendor', ['assessments'])
      .populate('industries.industryGroup', ['name'])
      .populate('industries.Finance.industryId', ['name'])
      .populate('industries.iGaming.industryId', ['name']);
  }
}

// Upcoming LQA
/**
 *
 * @param {Object} filters
 * @returns {Array} - returns filtered report
 */
const getXtrfUpcomingReport = async (filters) => {
  const { vendorFilter, sourceFilter, tierFilter, targetFilter, industryFilter, lqaFilter } = filters;
	const allSource = new Set().add('All')
	const allTarget = new Set().add('All')
	const allIndustry = new Set().add('All')
	const allVendor = new Set().add('All')
  try {
    const lqaReport = await XtrfLqaGrouped.find({},{ 'industries.vendors.otherInfo': 0 })
      .populate('sourceLanguage', ['lang'])
      .populate('targetLanguage', ['lang'])
      .populate('industries.vendors.vendor', ['assessments'])
      .populate('industries.industryGroup', ['name'])
      .populate('industries.industry', ['name',"_id"])
      // .populate('industries.vendors.vendor.assessments.industries.steps.step');
    const translationStep = await Step.findOne({title: 'Translation'},{title: 1})
    let result = []
    let filters = {}
    for (let { sourceLanguage: sourceLang, targetLanguage: targetLang, industries} of lqaReport) {
      const sourceLangID = sourceLang ? sourceLang._id.toString() : null
      const targetLangID = targetLang ? targetLang._id.toString() : null

      industries
        .filter(industry => (industry.industryGroup.name === 'Finance' || industry.industryGroup.name === 'iGaming'))
        .forEach(industry => {
          const vendorsNotNull = industry.vendors.filter(({vendor})=> vendor !== null)

	        allIndustry.add(industry.industryGroup.name)
          if (targetLang && sourceLang) {
            allSource.add(sourceLang.lang)
            allTarget.add(targetLang.lang)
          }

          vendorsNotNull.forEach(vendorNotNull => {
            const vendorTargetLang = targetLang ? targetLang.lang : 'no language data';
            const { name, wordCount, tier, vendor} = vendorNotNull
            allVendor.add(name)
            const assessmentIndex =
              vendor
                .assessments
                .findIndex(({targetLanguage, sourceLanguage}) =>
                  (
                    sourceLanguage.toString() === sourceLangID
                    && targetLanguage.toString() === targetLangID
                  )
                )
            const langPairAssessment = assessmentIndex >= 0 ?  vendor.assessments[assessmentIndex] : null
            const vendorId = vendor._id;
            const industryIndex = getAssessmentIndustryIndex(langPairAssessment, industry.industryGroup._id)
            const assessmentIndustry = industryIndex >= 0 ? langPairAssessment.industries[industryIndex] : null
            const steps = assessmentIndustry ? assessmentIndustry.steps : null

            const stepInfo = getStep(steps)

            if (canNextLQAStep(wordCount, stepInfo.field, 1)) return;

            let vendorInfo = {
              name,
              wordCount,
              tier,
              steps,
              sourceLang: sourceLang.lang,
              targetLang: vendorTargetLang,
              sourceLangInfo: sourceLang,
              targetLangInfo: targetLang,
              industry:  {name: industry.industryGroup.name, _id: industry.industryGroup._id },
              vendorId,
              mainIndex: assessmentIndex,
              industryIndex,
              stepIndex: 0,
              assessmentId: assessmentIndustry ? assessmentIndustry._id : null,
              step: translationStep,
            }
            vendorInfo = {...vendorInfo, ...stepInfo}

            const vendorInData = result.find((vendorNotNull) => {
              return vendorNotNull.name === name
                && vendorNotNull.sourceLang === sourceLang.lang
                && vendorNotNull.targetLang === vendorTargetLang
                && vendorNotNull.industry.name === industry.industryGroup.name
            })

            if (!vendorInData) {
              result.push(vendorInfo);
              return;
            }

            vendorInData.wordCount += wordCount
          })
        })

      function getAssessmentIndustryIndex(assessment, industryId) {
        if (!assessment) return -1;
        return assessment
          .industries
          .findIndex(({industry}) => {
            return industry._id.toString() === industryId.toString()
          });
      }

      function getStep (steps){
        if (!steps || !steps.length) return {lqaNumber: 'TQI',field: "tqi"}
        const [lastStep] = steps
        const {tqi, lqa1, lqa2, lqa3} = lastStep
        if (lqa3 && lqa3.grade) {
          return { lqaNumber: '', field: "done"}
        }
        if (lqa2 && lqa2.grade) {
          return { lqaNumber: '3',field: "Lqa3"}
        }
        if (lqa1 && lqa1.grade) {
          return {lqaNumber: '2',field: "Lqa2"}
        }
        if (tqi && tqi.grade) {
          return { lqaNumber: '1', field: "Lqa1"}
        }
      }
    }
    if (industryFilter) {
      result = result.filter(({ industry }) => industry.name === industryFilter);
    }
    if (vendorFilter) {
      result = result.filter(({ name }) => name === vendorFilter);
    }
    if (targetFilter) {
      result = result.filter(({ targetLang }) => targetLang === targetFilter);
    }
    if (sourceFilter) {
      result = result.filter(({ sourceLang }) =>{
      return sourceLang === sourceFilter
      })
    }
    if (tierFilter) {
      result = result.filter(({ tier }) => tier === tierFilter);
    }
    if (lqaFilter) {
      result = result.filter(({ field }) => field.toLowerCase() === lqaFilter);
    }
    filters = {sources: Array.from(allSource), targets: Array.from(allTarget), industries:  Array.from(allIndustry), vendors: Array.from(allVendor)}
    return {result, filters};
  } catch (err) {
    console.log(err);
    console.log('Error in getXtrfUpcomingReport');
  }
};
// function getAssessmentInfo(result) {
//   return  result.map((lqaReport)=> {
//     const {sourceLanguage: lqaSourceLang, targetLanguage: lqaTargetLang} = lqaReport
//     lqaReport.industries = lqaReport.industries.map(industry => {
//       const {industryGroup, vendors} = industry
//       vendors.map(vendorOne => {
//         const assessments =  vendorOne
//           .vendor
//           .assessments
//           .find(({sourceLanguage, targetLanguage}) =>
//             (
//               sourceLanguage === lqaSourceLang._id.toString()
//               && targetLanguage === lqaTargetLang._id.toString()
//             )
//           )
//         console.log(assessments);
//       })
//     })
//   })
// }

function groupXtrfLqaByIndustryGroup(result) {
  return  result.reduce((gropedByLangPair, lqaReport) => {
    if (!lqaReport) return gropedByLangPair
    const {languagePair: lqaLanguagePair, targetLanguage: lqaTargetLang} = lqaReport

    const lqaFoundByLanguages = gropedByLangPair.find(({languagePair}) => {
      return lqaLanguagePair === languagePair
    } )

    if (!lqaFoundByLanguages) gropedByLangPair.push(lqaReport)

    let lqaInGroupOrNew = lqaReport

    lqaInGroupOrNew.industries = lqaInGroupOrNew.industries.reduce((gByIndustryGroup, industry) => {
      const {industryGroup, vendors} = industry
      const notNullVendor = vendors.filter(({vendor})=> vendor)
      if(!industryGroup || !notNullVendor.length || !lqaTargetLang) return gByIndustryGroup
      const findIndustryId = gByIndustryGroup.findIndex(industryG => {
        return industryG.industryGroup._id.toString() === industryGroup._id.toString()
      });
      if (findIndustryId < 0) {
        industry.vendors = notNullVendor
        gByIndustryGroup.push(industry)
        return gByIndustryGroup;
      }
      gByIndustryGroup[findIndustryId].vendors = notNullVendor.reduce((resVendors, vendor)=> {
        // if(!vendor) return resVendors;
        const {name} = vendor
        const findVendorId = resVendors.findIndex(vendor => vendor.name === name)

        if (findVendorId < 0) {
          resVendors.push(vendor)
          return resVendors
        }

        const wordCount = resVendors[findVendorId].wordCount
        resVendors[findVendorId].wordCount = wordCount + vendor.wordCount

        return resVendors
      }, gByIndustryGroup[findIndustryId].vendors)
      return gByIndustryGroup
    }, [])
    return gropedByLangPair;
  }, [])
}

module.exports = {
  rebuildTierReportsStructure,
  getXtrfLqaReport,
  getXtrfUpcomingReport,
  groupXtrfLqaByIndustryGroup,
};
