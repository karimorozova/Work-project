const { Industries, MemoqProject, Languages, Vendors, XtrfLqa } = require('../models');
const { getMemoqUsers } = require('../services/memoqs/users');
const ObjectId = require('mongodb').ObjectID;

const personalFlat = (arr) => arr.reduce((acc, curr) => Array.isArray(curr) ? [...acc, ...personalFlat(curr)] : [...acc, curr], []);

const rebuildTierReportsStructure = (reports) => {
	let languagesArray = [];
	let result = [];
	reports.forEach(indArr => {
		const { industry } = indArr;
		const objName = industry === 'iGaming' ? "gameTier" : industry === 'Finance' ? "financeTier" : 'allTier';
		const languages = indArr.source.reduce((acc, curr) => {
			acc.push(curr.targets.map(target => {
				const sameLangsPairs = personalFlat(languagesArray)
						.findIndex(item => item.source === curr.lang && item.target === target.lang);
				const industryObj = {
					[objName]: {
						tier: getTierFromWordcount(Math.ceil(target.wordcount / 6), objName, curr.clients),
						wordcount: Math.ceil(target.wordcount / 6),
						clients: curr.clients
					}
				};
				const structureObject = {
					source: curr.lang,
					target: target.lang,
					...industryObj
				};
				return sameLangsPairs === -1 ? structureObject : Object.assign(personalFlat(languagesArray)[sameLangsPairs], industryObj)
			}));
			return acc
		}, []);
		languagesArray.push(...languages)
	});

	personalFlat(languagesArray).forEach(languages => {
		const sampleLangPair = result.findIndex(item => `${ item.source }-${ item.target }` === `${ languages.source }-${ languages.target }`);
		sampleLangPair === -1 && result.push(languages)
	});

	function getTierFromWordcount(wordcount, type, clientsCount) {
		return type === 'allTier' ? getTierAllType(wordcount, clientsCount) : getTierIgmingFinanceType(wordcount, clientsCount);
	}

	function getTierAllType(wordcount, clientsCount) {
		if(wordcount > 55000) {
			return 1;
		} else if(wordcount >= 10000) {
			return 2;
		} else {
			return 3;
		}
	}

	function getTierIgmingFinanceType(wordcount, clientsCount) {
		if(wordcount > 30000) {
			return 1;
		} else if(wordcount >= 5000 && wordcount < 30000) {
			return 2;
		} else {
			return 3;
		}
	}

	return result;
};


const filterReports = (reports, filters) => {
	let result;
	const filterKeys = Object.keys(filters);
	if(filterKeys.length) {
		if(filterKeys.length === 1 && filterKeys[0] !== 'tierFilter') {
			let key = filterKeys[0] === 'sourceFilter' ? 'source' : 'target';
			result = reports.filter(i => i[key] === filters[filterKeys[0]])
		} else if(filterKeys.length === 2 && !filterKeys.includes('tierFilter')) {
			result = filteredLanguages(reports)
		} else if(filterKeys.length === 3) {
			result = filteredLanguages(reports);
			result = filteredTiers(result)
		} else if(filterKeys.length === 1 && filterKeys[0] === 'tierFilter') {
			result = filteredTiers(reports);
		} else if(filterKeys.length === 2 && filterKeys.includes('tierFilter')) {
			let key = filterKeys.filter(i => i !== 'tierFilter')[0] === 'sourceFilter' ? 'source' : 'target';
			result = reports.filter(i => i[key] === filters[filterKeys[0]]);
			result = filteredTiers(result)
		}
	} else {
		result = reports;
	}

	function filteredLanguages(arr) {
		return arr.filter(i => i.source === filters.sourceFilter).filter(i => i.target === filters.targetFilter)
	}

	function filteredTiers(arr) {
		return arr.filter(i =>
				i.hasOwnProperty('allTier') && i.allTier.tier === filters.tierFilter ||
				i.hasOwnProperty('financeTier') && i.financeTier.tier === filters.tierFilter ||
				i.hasOwnProperty('gameTier') && i.gameTier.tier === filters.tierFilter)
	}

	return result;
};


//// Tier report /////

// async function getXtrfTierReport(filters, grouped = false) {
//   const today = new Date();
//   let start = new Date(today.getFullYear(), today.getMonth() - 6, -1);
//   start.setHours(0, 0, 0, 0);
//   try {
//     const filterQuery = filters.targetFilter ? { lang: { $in: filters.targetFilter } } : {};
//     const languages = await Languages.find(filterQuery);
//     let reports = await LangTier.find();
//     let result = getParsedReport(reports, languages);
//     if (filters.tierFilter) {
//       result = result.filter(item => {
//         return item.allTier.tier === filters.tierFilter
//           || item.financeTier.tier === filters.tierFilter
//           || item.gameTier.tier === filters.tierFilter;
//       });
//     }
//     const groupedLangs = getGroupedLangs(result, 'group');
//     return grouped ? groupedLangs : result;
//   } catch(err) {
//     console.log(err);
//     console.log("Error in getXtrfTierReport");
//   }
// }

// function getParsedReport(reports, languages) {
//   let result = [];
//   for (let { lang, memoq, group } of languages) {
//     const langReport = getLangReport(lang, memoq, group, reports);
//     result.push(langReport);
//   }
//   result = result.sort((a, b) => a.target > b.target ? 1 : -1);
//   return result;
// }
//
// function getGroupedLangs(array, key) {
//   const grouped = groupByKey(array, key);
//   return Object.keys(grouped).reduce((prev, curr) => ({
//     ...prev,
//     [curr]: grouped[curr].reduce((prevLang, currLang) => {
//       return ({
//         target: curr,
//         allTier: {
//           tier: currLang.allTier.tier,
//           wordcount: prevLang.allTier.wordcount + currLang.allTier.wordcount,
//           clients: Math.ceil(prevLang.allTier.clients + currLang.allTier.clients),
//         },
//         financeTier: {
//           tier: currLang.financeTier.tier,
//           wordcount: prevLang.financeTier.wordcount + currLang.financeTier.wordcount,
//           clients: Math.ceil(prevLang.financeTier.clients + currLang.financeTier.clients),
//         },
//         gameTier: {
//           tier: currLang.gameTier.tier,
//           wordcount: prevLang.gameTier.wordcount + currLang.gameTier.wordcount,
//           clients: Math.ceil(prevLang.gameTier.clients + currLang.gameTier.clients),
//         }
//       });
//     }, {
//       allTier: {
//         wordcount: 0,
//         clients: 0
//       },
//       financeTier: {
//         wordcount: 0,
//         clients: 0
//       },
//       gameTier: {
//         wordcount: 0,
//         clients: 0
//       }
//     })
//   }), {});
// }

// function groupByKey(array, key) {
//   return array.reduce((result, currentValue) => {
//     (result[currentValue[key]] = result[currentValue[key]] || []).push(currentValue);
//     return result;
//   }, {});
// }
//
// function getLangReport(lang, memoq, group, reports) {
//   let result = { target: lang, memoqSymbol: memoq, group };
//   result.allTier = getTier(lang, reports, 'General');
//   result.financeTier = getTier(lang, reports, 'Finance');
//   result.gameTier = getTier(lang, reports, 'iGaming');
//   return result;
// }

// function getTier(lang, reports, industry) {
//   let totalWords = 0;
//   let totalClients = 0;
//   const filteredReports = industry !== 'General' ?
//     reports.filter(item => item.industry === industry)
//     : reports;
//   for (let report of filteredReports) {
//     const targetLang = report.languages[lang];
//     const { wordcount, clients } = targetLang ? getClientsWordcount(targetLang) : { wordcount: 0, clients: 0 };
//     totalWords += wordcount;
//     totalClients += clients;
//   }
//   totalWords = Math.round(totalWords / 6);
//   totalClients = +(totalClients / 6).toFixed(1);
//   return industry === 'General' ? getAllTier(totalWords, totalClients) : getSpecificTier(totalWords, totalClients);
// }

// function getClientsWordcount(targetLang) {
//   const wordcount = Object.keys(targetLang).reduce((acc, cur) => {
//     acc += targetLang[cur];
//     return acc;
//   }, 0);
//   const clients = Object.keys(targetLang).length;
//   return { wordcount, clients };
// }
//
// function getAllTier(wordcount, clients) {
//   let tier = 2;
//   if ((wordcount > 55000 && clients > 9) || wordcount > 100000) {
//     tier = 1;
//   } else if (wordcount < 5000 || (wordcount < 10000 && clients < 5)) {
//     tier = 3;
//   }
//   return { tier, wordcount, clients };
// }
//
// function getSpecificTier(wordcount, clients) {
//   let tier = 2;
//   if ((wordcount > 30000 && clients > 4) || wordcount > 60000) {
//     tier = 1;
//   } else if (wordcount < 2500 || (wordcount < 5000 && clients < 3)) {
//     tier = 3;
//   }
//   return { tier, wordcount, clients };
// }
//
// function getLqaAllTier(wordcount) {
//   let tier = 2;
//   if (wordcount > 100000) {
//     tier = 1;
//   } else if (wordcount < 5000) {
//     tier = 3;
//   }
//   return tier;
// }

function getLqaSpecificTierForVendor(vendor) {
	let tier = 2;
	if(vendor.wordCount > 60000) {
		tier = 1;
	} else if(vendor.wordCount < 2500) {
		tier = 3
	}
	return tier;
}

function getLqaSpecificTier(vendors) {
	let wordCount = 0;
	for (let vendor of vendors) {
		wordCount += vendor.wordCount;
	}
	let tier = 2;
	if(wordCount > 60000) {
		tier = 1;
	} else if(wordCount < 2500) {
		tier = 3;
	}
	return tier;
}

//// Lqa report /////
async function getXtrfLqaReport(filters) {
  let { sourceFilter, targetFilter, vendorFilter, countFilter, skipCount, tierFilter, industryFilter } = filters;
  const languages = await Languages.find();
  const filterQuery = await getFilteringQuery(filters, languages);
  countFilter = sourceFilter || targetFilter || vendorFilter ? 0 : countFilter;
  skipCount = sourceFilter || targetFilter || vendorFilter ? 0 : skipCount;
  const dataLimitQuery = { 'industries.Finance.vendors.otherInfo': 0, 'industries.iGaming.vendors.otherInfo': 0 };
  try {
    let result = [];
    const xtrfLqaReport = await getReport();
    for (let { sourceLanguage, targetLanguage, industries } of xtrfLqaReport) {
      sourceLanguage = sourceLanguage ? sourceLanguage.lang : 'no language data';
      targetLanguage = targetLanguage ? targetLanguage.lang : 'no language data';
      result.push({
        sourceLanguage,
        targetLanguage,
        industries
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

  async function getReport () {
    return await XtrfLqa.find(filterQuery, dataLimitQuery).skip(skipCount).limit(countFilter)
      .populate('sourceLanguage', ['lang'])
      .populate('targetLanguage', ['lang'])
      .populate('industries.Finance.industryId', ['name'])
      .populate('industries.iGaming.industryId', ['name']);
  }
}

const getLqaReportFilterOptions = (lqaReport) => {
  const allSourceLanguages = [];
  const allTargetLanguages = [];
  const allVendors = [];
  for (let { sourceLanguage, targetLanguage, industries } of lqaReport) {
    const { Finance, iGaming } = industries;
    const { vendors: financeVendors } = Finance;
    const { vendors: iGamingVendors } = iGaming;
    allSourceLanguages.push(sourceLanguage.lang);
    targetLanguage && allTargetLanguages.push(targetLanguage.lang);
    const financeVendorNames = financeVendors.map(vendor => vendor.name);
    const igamingVendorNames = iGamingVendors.map(vendor => vendor.name);
    allVendors.push(...financeVendorNames, ...igamingVendorNames);
  }
  return {
    availableSources: Array.from(new Set(allSourceLanguages)),
    availableTargets: Array.from(new Set(allTargetLanguages)),
    availableVendors: Array.from(new Set(allVendors)),
  };
};

async function getVendorAssessment (assessments, queryIndustry) {
  const result = {
    TQI: [],
  };
  for (let item of assessments) {
    if (item.industries.length) {
      for (let { steps, industry } of item.industries) {
        const { name } = await Industries.findOne({ _id: industry });
        if (name === queryIndustry) {
					for (let { tqi, lqa1, lqa2, lqa3 } of steps) {
						result.TQI.push(tqi.grade);
						lqa1.grade && setLQA('lqa1Score', lqa1.grade)
						lqa2.grade && setLQA('lqa2Score', lqa2.grade)
						lqa3.grade && setLQA('lqa3Score', lqa3.grade)
					}
				}
			}
		}
	}

	function setLQA(key, value) {
		result[key] = value;
	}

	return result;
}

function getIndustryDocs(arr, industry) {
	const industryMemoq = arr.filter(item => item.domain === industry);
	return industryMemoq.reduce((acc, cur) => [...acc, ...cur.documents], []);
}

function getLqaWordcount(tier, arr, vendorName) {
	return arr.reduce((acc, cur) => {
		if(Object.keys(cur.UserAssignments).length && cur.TargetLangCode === tier.memoqSymbol) {
			const { TranslationDocumentUserRoleAssignmentDetails } = cur.UserAssignments;
			const translator = TranslationDocumentUserRoleAssignmentDetails[0];
			if(translator) {
				if(!vendorName || vendorName && translator.UserInfoHeader.FullName.match(RegExp(`${ vendorName }`, `i`))) {
					acc[translator.UserInfoHeader.FullName] = acc[translator.UserInfoHeader.FullName] ?
							{
								...acc[translator.UserInfoHeader.FullName],
								wordCount: acc[translator.UserInfoHeader.FullName].wordCount + +cur.TotalWordCount
							}
							: {
								name: translator.UserInfoHeader.FullName,
								wordCount: +cur.TotalWordCount,
							};
				}
			}
		}
		return acc;
	}, {});
}

function getUpcomingWordcount(tiers, arr, vendorName, industry) {
	return arr.reduce((acc, cur) => {
		const tier = tiers.find(tier => tier && tier.memoqSymbol === cur.TargetLangCode);
		if(Object.keys(cur.UserAssignments).length && !!tier) {
			const { TranslationDocumentUserRoleAssignmentDetails } = cur.UserAssignments;
			const translator = TranslationDocumentUserRoleAssignmentDetails[0];
			if(translator) {
				if(!vendorName || vendorName && translator.UserInfoHeader.FullName.match(RegExp(`${ vendorName }`, `i`))) {
					acc[translator.UserInfoHeader.FullName] = acc[translator.UserInfoHeader.FullName] ?
							{
								...acc[translator.UserInfoHeader.FullName],
								wordCount: acc[translator.UserInfoHeader.FullName].wordCount + +cur.TotalWordCount
							}
							: {
								id: translator.UserInfoHeader.UserGuid,
								name: translator.UserInfoHeader.FullName,
								wordCount: +cur.TotalWordCount,
								langCode: cur.TargetLangCode,
							};
				}
			}
		}
		return acc;
	}, {});
}

async function getFilteringQuery (filters) {
  const { industryFilter, vendorFilter } = filters;

  let query = {
    $or: [{ 'industries.Finance.vendors': { $not: { $size: 0 } } }, { 'industries.iGaming.vendors': { $not: { $size: 0 } } }]
  };
  if (filters.vendorFilter) {
    query.$or = [
      { 'industries.Finance.vendors.name': { $in: [`${vendorFilter}`] } },
      { 'industries.iGaming.vendors.name': { $in: [`${vendorFilter}`] } }
    ];
  }
  if (filters.industryFilter) {
    if (industryFilter !== 'All') {
      query[`industries.${industryFilter}.vendors`] = { $not: { $size: 0 } };
    }

  }
  return query;
}

async function getVendorsQuery(filters) {
	let query = { $and: [{ status: 'Active' }, { wordCountInfo: { $ne: [] } }] };
	if(filters.nameFilter) {
		query.firstName = { '$regex': new RegExp(`${ filters.nameFilter }`, 'i') };
	}
	return query;
}

function isEmpty(obj) {
	for (let key in obj) {
		if(obj.hasOwnProperty(key))
			return false;
	}
	return true;
}

function setLQA(vendor, { LQA1, LQA2, LQA3 }) {
	// const { tier } = getSpecificTier(vendor.wordCount);
	// const vendorLqa = await TierLqa.findOne({ category: tier });
	if(!isEmpty(LQA1) && !isEmpty(LQA2) && !isEmpty(LQA3)) {
		return {
			...vendor,
			LQA: 'passed',
		}
	} else if(!isEmpty(LQA1) && !isEmpty(LQA2)) {
		return {
			...vendor,
			LQA: 3,
		}
	} else if(!isEmpty(LQA1)) {
		return {
			...vendor,
			LQA: 2,
		}
	}
	return {
		...vendor,
		LQA: 1,
	}
}

async function getVendorLqa(obj) {
	const vendors = await Vendors.find({ assessments: { $gt: [] } });
	const memoqUsers = await getMemoqUsers();
	return Object.values(obj).map(vendor => {
		const neededVendor = memoqUsers.find(user => user.id === vendor.id);
		const dbVendor = vendors.find(vendor => vendor.email === neededVendor.email);
		vendor.tier = getLqaSpecificTierForVendor(vendor);
		if(dbVendor) {
			return setLQA(vendor, dbVendor.assessments[0]);
		}
		return {
			...vendor,
			LQA: 1,
		};
	});
}

// Upcoming LQA
async function getXtrfUpcomingReport(filters) {
	const filterQuery = getFilteringQuery(filters);
	const { nameFilter } = filters;
	try {
		const tiers = await getXtrfTierReport(filters);
		const memoqs = await MemoqProject.find(filterQuery);
		const financeDocs = getIndustryDocs(memoqs, 'Finance');
		const gamingDocs = getIndustryDocs(memoqs, 'iGaming');
		let financeReports = getUpcomingWordcount(tiers, financeDocs, nameFilter, 'Finance');
		let gamingReports = getUpcomingWordcount(tiers, gamingDocs, nameFilter, 'iGaming');
		financeReports = await getVendorLqa(financeReports);
		gamingReports = await getVendorLqa(gamingReports);
		if(filters.tierFilter) {
			Object.values(financeReports).filter(item => item.tier === filters.tierFilter);
			Object.values(gamingReports).filter(item => item.tier === filters.tierFilter);
		}
		if(filters.lqaFilter) {
			financeReports = financeReports.filter(item => item.LQA === +filters.lqaFilter);
			gamingReports = gamingReports.filter(item => item.LQA === +filters.lqaFilter);
		}
		return {
			financeReports: financeReports.filter(vendor => vendor.LQA !== 'passed'),
			gamingReports: gamingReports.filter(vendor => vendor.LQA !== 'passed'),
		};
	} catch (err) {
		console.log(err);
		console.log("Error in getXtrfUpcomingReport");
	}
}

module.exports = {
  rebuildTierReportsStructure,
  getXtrfLqaReport,
  getXtrfUpcomingReport,
  filterReports,
  getLqaSpecificTierForVendor,
  getLqaReportFilterOptions
};
