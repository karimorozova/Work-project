const { Languages, XtrfLqa } = require('../models');
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
    return result;
  } catch (err) {
    console.log(err);
    console.log('Error in getXtrfLqaReport');
  }

  /**
   *
   * @returns {Array} returns report with populated(filled from other collections) data
   */
  async function getReport() {
    return await XtrfLqa.find(filterQuery, dataLimitQuery).skip(skipCount).limit(countFilter)
      .populate('sourceLanguage', ['lang'])
      .populate('targetLanguage', ['lang'])
      .populate('industries.industry', ['name'])
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
      .populate('industries.industryGroup', ['name']);
    let result = [];
    for (let { sourceLanguage, targetLanguage, industries } of lqaReport) {
      industries
        .filter(industry => (industry.industryGroup.name === 'Finance' || industry.industryGroup.name === 'iGaming'))
        .forEach(industry => {
          result.push(...getVendorsData(industry.vendors, sourceLanguage, targetLanguage, industry.industryGroup.name))
        })
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

      const findIndustryId = gByIndustryGroup.findIndex(industryG => industryG.industryGroup.name === industryGroup.name);
      if (findIndustryId < 0) {
        gByIndustryGroup.push(industry)
        return gByIndustryGroup;
      }

      gByIndustryGroup[findIndustryId].vendors = vendors.reduce((resVendors, vendor)=> {
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
