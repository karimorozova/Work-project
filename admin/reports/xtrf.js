const { Languages, XtrfLqa, Vendor } = require('../models');
const {
  getFilteringQueryForLqaReport,
  getVendorsData,
  getTierFromWordcount,
  personalFlat
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
              tier: getTierFromWordcount(Math.ceil(target.wordcount / 5), objName, curr.clients),
              wordcount: Math.ceil(target.wordcount / 5),
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
  const filterQuery = await getFilteringQueryForLqaReport(filters, languages);
  countFilter = sourceFilter || targetFilter || vendorFilter ? 0 : countFilter;
  skipCount = sourceFilter || targetFilter || vendorFilter ? 0 : skipCount;
  const dataLimitQuery = { 'industries.Finance.vendors.otherInfo': 0, 'industries.iGaming.vendors.otherInfo': 0 };
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
        industries
      });
    }

    groupXtrfLqaByIndustryGroup(result)

    if (sourceFilter) {
      result = result.filter(({ sourceLanguage }) => sourceLanguage === sourceFilter);
    }

    if (targetFilter) {
      result = result.filter(({ targetLanguage }) => targetLanguage === targetFilter);
    }

    if (vendorFilter) {
      result = result.map(row => {
        let { Finance, iGaming } = row.industries;
        const { vendors: financeVendors } = Finance;
        const { vendors: igamingVendors } = iGaming;
        Finance.vendors = financeVendors.filter(({ name }) => name === vendorFilter);
        iGaming.vendors = igamingVendors.filter(({ name }) => name === vendorFilter);
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
          const { Finance, iGaming } = item.industries;
          switch (industryFilter) {
            case 'Finance':
              iGaming.vendors = [];
              return item;
            case 'iGaming':
              Finance.vendors = [];
              return item;
            case 'Other':
              Finance.vendors = [];
              iGaming.vendors = [];
              return item;
          }
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
    return await XtrfLqa.find(filterQuery, dataLimitQuery)
      .populate('sourceLanguage', ['lang'])
      .populate('targetLanguage', ['lang'])
      .populate('industries.industry', ['name'])
      .populate('industries.vendors.vendor')
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
  const { nameFilter, tierFilter, industryFilter } = filters;
  try {
    const lqaReport = await XtrfLqa.find()
      .populate('sourceLanguage', ['lang'])
      .populate('targetLanguage', ['lang'])
      .populate('industries.vendors.vendor', ['assessments'])
      .populate('industries.industryGroup', ['name'])
      .populate('industries.industry', ['name']);
    let result = [];
    for (let { sourceLanguage: sourceLang, targetLanguage: targetLang, industries } of lqaReport) {
      industries
        .filter(industry => (industry.industryGroup.name === 'Finance' || industry.industryGroup.name === 'iGaming'))
        .forEach(industry => {
          const vendorsNotNull =  industry.vendors.filter(({vendor})=> vendor !== null)

          vendorsNotNull.forEach(vendorNotNull => {
            const vendorTargetLang = targetLang ? targetLang.lang : 'no language data';
            const { name, wordCount, tier} = vendorNotNull
            const assessment =  vendorNotNull.vendor.assessments;
            const vendorId = vendorNotNull.vendor._id;
            const steps = getSteps(assessment, industry.industry._id)
            const stepInfo = getStepInfo(steps)
            let vendorInfo = {
              name,
              wordCount,
              tier,
              steps,
              sourceLang: sourceLang.lang,
              targetLang: vendorTargetLang,
              industries: industry.industryGroup.name,
              vendorId,
              step: 'Translations',
            }
            vendorInfo = {...vendorInfo, ...stepInfo}

            const vendorInData = result.find((vendorNotNull) => {
              return vendorNotNull.name === name
                && vendorNotNull.sourceLang === sourceLang.lang
                && vendorNotNull.targetLang === vendorTargetLang
                && vendorNotNull.industries === industry.industryGroup.name
            })

            if (!vendorInData) {
              result.push(vendorInfo);
              return;
            }

            vendorInData.wordCount += wordCount
          })
        })
      function getSteps(assessment, industryId) {
        if (!assessment.length) return null;
        const assessmentByIndustry = assessment[0]
          .industries
          .find(({industry: assessmentIndustry}) => {
            return assessmentIndustry._id.toString() ===  industryId.toString()
          })

        return assessmentByIndustry ? assessmentByIndustry.steps : null;
      }
      function getStepInfo (steps){
        if (!steps) return {lqaNumber: '-', modalLqa: {isTqi: false}}
        const lastStep = steps.pop()
        const {tqi, lqa1, lqa2, lqa3} = lastStep
        if (lqa3 && lqa3.grade) {
          return { lqaNumber: '3', modalLqa: {isLqa3: true}}
        }
        if (lqa2 && lqa2.grade) {
          return { lqaNumber: '2',modalLqa: {isLqa2: true}}
        }
        if (lqa1 && lqa1.grade) {
          return {lqaNumber: '1',modalLqa: {isLqa1: true}}
        }
        if (tqi && tqi.grade) {
          return { lqaNumber: 'TQI', modalLqa: {isTqi: true}}
        }
      }
    }
    if (industryFilter) {
      result = result.filter(({ industry }) => industry === industryFilter);
    }
    if (nameFilter) {
      const nameRegex = new RegExp(nameFilter, 'i');
      result = result.filter(({ name }) => nameRegex.test(name));
    }
    if (tierFilter) {
      result = result.filter(({ tier }) => tier === tierFilter);
    }
    return result;
  } catch (err) {
    console.log(err);
    console.log('Error in getXtrfUpcomingReport');
  }
};

function groupXtrfLqaByIndustryGroup(result) {
  return result.map(lqaReport => {
    lqaReport.industries = lqaReport.industries.reduce((gByIndustryGroup, industry) => {
      const {industryGroup, vendors} = industry
      const notNullVendor = vendors.filter(({vendor})=> vendor)
      if(!industryGroup || !notNullVendor.length) return gByIndustryGroup

      const findIndustryId = gByIndustryGroup.findIndex(industryG => industryG.industryGroup.name === industryGroup.name);
      if (findIndustryId < 0) {
        industry.vendors = notNullVendor
        gByIndustryGroup.push(industry)
        return gByIndustryGroup;
      }

      gByIndustryGroup[findIndustryId].vendors = notNullVendor.reduce((resVendors, vendor)=> {
        if(!vendor) return resVendors;
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
    return lqaReport;
  })
}

module.exports = {
  rebuildTierReportsStructure,
  getXtrfLqaReport,
  getXtrfUpcomingReport,
  groupXtrfLqaByIndustryGroup,
};
