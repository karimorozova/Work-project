/**
 *
 * @param {Array} reports
 * @param {Object} filters
 * @returns {Array} - returns filtered or non-filtered reports
 */
const filterTierReport = (reports, filters) => {
  let result;
  const filterKeys = Object.keys(filters);
  if (filterKeys.length) {
    if (filterKeys.length === 1 && filterKeys[0] !== 'tierFilter') {
      let key = filterKeys[0] === 'sourceFilter' ? 'source' : 'target';
      result = reports.filter(i => i[key] === filters[filterKeys[0]]);
    } else if (filterKeys.length === 2 && !filterKeys.includes('tierFilter')) {
      result = filteredLanguages(reports);
    } else if (filterKeys.length === 3) {
      result = filteredLanguages(reports);
      result = filteredTiers(result);
    } else if (filterKeys.length === 1 && filterKeys[0] === 'tierFilter') {
      result = filteredTiers(reports);
    } else if (filterKeys.length === 2 && filterKeys.includes('tierFilter')) {
      let key = filterKeys.filter(i => i !== 'tierFilter')[0] === 'sourceFilter' ? 'source' : 'target';
      result = reports.filter(i => i[key] === filters[filterKeys[0]]);
      result = filteredTiers(result);
    }
  } else {
    result = reports;
  }

  function filteredLanguages (arr) {
    return arr.filter(i => i.source === filters.sourceFilter).filter(i => i.target === filters.targetFilter);
  }

  function filteredTiers (arr) {
    return arr.filter(i =>
      i.hasOwnProperty('allTier') && i.allTier.tier === filters.tierFilter ||
      i.hasOwnProperty('financeTier') && i.financeTier.tier === filters.tierFilter ||
      i.hasOwnProperty('gameTier') && i.gameTier.tier === filters.tierFilter);
  }

  return result;
};

/**
 *
 * @param {Array} lqaReport
 * @returns {{availableVendors: {Array}, availableTargets: {Array}, availableSources: {Array}}}
 */
const getLqaReportFilterOptions = (lqaReport) => {
  const allSourceLanguages = [];
  const allTargetLanguages = [];
  const allVendors = new Set();

  for (let { sourceLanguage, targetLanguage, industries } of lqaReport) {
    industries.map(({vendors})=> {
      vendors
        .filter(({vendor}) => vendor)
        .forEach(({name})=>{
          allSourceLanguages.push(sourceLanguage.lang);
          targetLanguage && allTargetLanguages.push(targetLanguage.lang);
          allVendors.add(name)
        })
    })
  }
  return {
    availableSources: Array.from(new Set(allSourceLanguages)),
    availableTargets: Array.from(new Set(allTargetLanguages)),
    availableVendors: Array.from(allVendors),
  };
};

/**
 *
 * @param {Object} filters
 * @returns {Object} - returns query for DB
 */
const getFilteringQueryForLqaReport = async (filters) => {
  const { industryFilter, vendorFilter } = filters;
  let query = {
    $or: [
      { 'industries.vendors': { $not: { $size: 0 } } },
      { 'industries.vendors': { $not: { $size: 0 } } }
    ]
  };
  if (filters.vendorFilter) {
    query.$or = [
      { 'industries.vendors.name': { $in: [`${vendorFilter}`] } },
      { 'industries.vendors.name': { $in: [`${vendorFilter}`] } }
    ];
  }
  if (filters.industryFilter) {
    if (industryFilter !== 'All') {
      query[`industries.${industryFilter}.vendors`] = { $not: { $size: 0 } };
    }

  }
  return query;
};

/**
 *
 * @param {Array} vendorsArr
 * @param {Object} sourceLanguage
 * @param {Object} targetLanguage
 * @param {Object} industry
 * @returns {Array} - returns vendor's data
 */
const getVendorsData = (vendorsArr, sourceLanguage, targetLanguage, industry) => {
  const data = [];
  for (let { name, vendorId, wordCount, tier } of vendorsArr) {
    const targetLanguages = targetLanguage ? targetLanguage.lang : 'no language data';

    const vendorInData = data.find((vendor) => {
      return vendor.vendorId === vendorId
              && vendor.sourceLanguage === sourceLanguage.lang
              && vendor.targetLanguage === targetLanguages
              && vendor.industry === industry
    })

    if (!vendorInData) {
      data.push({
        name,
        vendorId,
        wordCount,
        tier,
        sourceLanguage: sourceLanguage.lang,
        targetLanguage: targetLanguages,
        industry
      });
      continue;
    }

    vendorInData.wordCount += wordCount
  }
  return data;
};

const getLqaSpecificTierForVendor = (vendor) => {
  let tier = 2;
  if (vendor.wordCount > 60000) {
    tier = 1;
  } else if (vendor.wordCount < 2500) {
    tier = 3;
  }
  return tier;
};

const getTierFromWordcount = (wordcount, type, clientsCount) => {
  return type === 'allTier' ? getTierAllType(wordcount) :
    getTierIgamingFinanceType(wordcount, clientsCount);
};

const getTierAllType = (wordcount) => {
  if (wordcount > 55000) {
    return 1;
  } else if (wordcount >= 10000) {
    return 2;
  } else {
    return 3;
  }
};

const getTierIgamingFinanceType = (wordcount) => {
  if (wordcount > 30000) {
    return 1;
  } else if (wordcount >= 5000 && wordcount < 30000) {
    return 2;
  } else {
    return 3;
  }
};

const personalFlat = (arr) => (
  arr.reduce((acc, curr) => Array.isArray(curr) ? [...acc, ...personalFlat(curr)] : [...acc, curr], [])
);

module.exports = {
  filterTierReport,
  getLqaReportFilterOptions,
  getFilteringQueryForLqaReport,
  getVendorsData,
  getLqaSpecificTierForVendor,
  getTierFromWordcount,
  personalFlat
};
