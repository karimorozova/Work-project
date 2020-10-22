const { Industries, LangTier, Languages, MemoqProject, Vendors } = require("../models");
const { getMemoqUsers } = require("../services/memoqs/users");


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
						tier: getTierFromWordcount(target.wordcount, objName, target.clients),
						wordcount: target.wordcount,
						clients: 222
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
		if(wordcount > 55000 && clientsCount > 9) {
			return 1;
		} else if(wordcount >= 10000 && clientsCount >= 5 && clientsCount <= 9) {
			return 2;
		} else {
			return 3;
		}
	}

	function getTierIgmingFinanceType(wordcount, clientsCount) {
		if(wordcount > 30000 && clientsCount > 4) {
			return 1;
		} else if(wordcount >= 5000 && wordcount < 30000 && clientsCount >= 3 && clientsCount <= 4) {
			return 2;
		} else {
			return 3;
		}
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
	const filterQuery = getFilteringQuery(filters);
	const vendorFilterQuery = await getVendorsQuery(filters);
	const { nameFilter, industryFilter, targetFilter, tierFilter } = filters;
	try {
		const tiers = await getXtrfTierReport(filters);
		const vendors = await Vendors.find(vendorFilterQuery);
		const memoqs = await MemoqProject.find(filterQuery);
		const financeDocs = getIndustryDocs(memoqs, 'Finance');
		const gamingDocs = getIndustryDocs(memoqs, 'iGaming');
		let calculatedTiers = [];
		calculatedTiers.push(tiers.reduce((acc, curr) => {
			acc[curr.group] = acc[curr.group] ?
					{
						...acc[curr.group],
						allTier: {
							wordcount: acc[curr.group].allTier.wordcount + curr.allTier.wordcount,
						},
						financeTier: {
							wordcount: acc[curr.group].financeTier.wordcount + curr.financeTier.wordcount,
						},
						gameTier: {
							wordcount: acc[curr.group].gameTier.wordcount + curr.gameTier.wordcount,
						}
					} : {
						group: curr.group,
						memoqSymbol: curr.memoqSymbol,
						allTier: {
							wordcount: curr.allTier.wordcount,
						},
						financeTier: {
							wordcount: curr.financeTier.wordcount,
						},
						gameTier: {
							wordcount: curr.gameTier.wordcount,
						}
					};
			return acc;
		}, {}));
		calculatedTiers = calculatedTiers.reduce((acc, curr) => {
			acc.push(...Object.values(curr));
			return acc;
		}, []);
		const memoqVendors = calculatedTiers.map(tier => ({
			target: tier.group,
			finance: {
				vendors: [...Object.values(getLqaWordcount(tier, financeDocs, nameFilter))],
			},
			gaming: {
				vendors: [...Object.values(getLqaWordcount(tier, gamingDocs, nameFilter))],
			},
			other: {
				vendors: [],
			}
		}));
		for (let { firstName, surname, wordCountInfo, assessments } of vendors) {
			for (let { industry, targetLanguage: { group }, wordCount } of wordCountInfo) {
				const name = surname ? `${ firstName } ${ surname }` : firstName;
				const memoqIndex = memoqVendors.findIndex(item => item.target === group);
				const memoqDoc = memoqVendors[memoqIndex];
				if(!!memoqDoc && industry.name.toString() === 'Finance') {
					const financeVendorIndex = memoqDoc.finance.vendors.findIndex(vendor => vendor.name === name);
					if(financeVendorIndex !== -1) {
						const updatedVendor = {
							...memoqDoc.finance.vendors[financeVendorIndex],
							wordCount: memoqDoc.finance.vendors[financeVendorIndex].wordCount + wordCount,
						};
						memoqDoc.finance.vendors.splice(financeVendorIndex, 1, updatedVendor);
					} else {
						memoqDoc.finance.vendors.push({
							name,
							wordCount,
							assessments: assessments.length ? [await getVendorAssessment(assessments, 'Finance')] : []
						});
					}
					memoqVendors.splice(memoqIndex, 1, memoqDoc);
				} else if(!!memoqDoc && industry.name.toString() === 'iGaming') {
					const gamingVendorIndex = memoqDoc.gaming.vendors.findIndex(vendor => vendor.name === name);
					if(gamingVendorIndex !== -1) {
						const updatedVendor = {
							...memoqDoc.gaming.vendors[gamingVendorIndex],
							wordCount: memoqDoc.gaming.vendors[gamingVendorIndex].wordCount + wordCount,
							assessments,
						};
						memoqDoc.gaming.vendors.splice(gamingVendorIndex, 1, updatedVendor);
					} else {
						memoqDoc.gaming.vendors.push({
							name,
							wordCount,
							assessments: assessments.length ?
									[await getVendorAssessment(assessments, 'iGaming')] : [],
						});
					}
					memoqVendors.splice(memoqIndex, 1, memoqDoc);
				} else if(!!memoqDoc && industry.name.toString() === 'Other') {
					const otherVendorIndex = memoqDoc.other.vendors.findIndex(vendor => vendor.name === name);
					if(otherVendorIndex !== -1) {
						const updatedVendor = {
							...memoqDoc.other.vendors[otherVendorIndex],
							wordCount: memoqDoc.other.vendors[otherVendorIndex].wordCount + wordCount,
						};
						memoqDoc.other.vendors.splice(otherVendorIndex, 1, updatedVendor);
					} else {
						memoqDoc.other.vendors.push({
							name,
							wordCount,
						});
					}
					memoqVendors.splice(memoqIndex, 1, memoqDoc);
				}
			}
		}
		let result = memoqVendors.map(vendor => ({
			target: vendor.target,
			finance: {
				tier: getLqaSpecificTier(vendor.finance.vendors),
				...vendor.finance,
			},
			gaming: {
				tier: getLqaSpecificTier(vendor.gaming.vendors),
				...vendor.gaming,
			},
			other: {
				tier: getLqaSpecificTier(vendor.other.vendors),
				...vendor.other
			}
		}));
		if(industryFilter) {
			if(industryFilter === 'Finance') {
				result = result.map(vendor => ({
					target: vendor.target,
					finance: {
						...vendor.finance,
					}
				})).filter(vendor => vendor.finance.vendors.length);
			} else if(industryFilter === 'iGaming') {
				result = result.map(vendor => ({
					target: vendor.target,
					gaming: {
						...vendor.gaming
					}
				})).filter(vendor => vendor.gaming.vendors.length);
			} else {
				result = result.map(vendor => ({
					target: vendor.target,
					other: {
						...vendor.other
					}
				})).filter(vendor => vendor.other.vendors.length);
			}
		}
		if(targetFilter) {
			const langGroupObjects = await Languages.find({ lang: { $in: targetFilter } });
			const langGroups = [];
			for (let { group } of langGroupObjects) {
				langGroups.push(group);
			}
			const filteredReport = [];
			for (let group of [...new Set(langGroups)]) {
				filteredReport.push(result.find(vendor => vendor.target === group));
			}
			result = filteredReport;
		}
		if(tierFilter) {
			result = result.map(item => {
				if(item.finance && item.finance.tier !== tierFilter) {
					delete item.finance;
				}
				if(item.gaming && item.gaming.tier !== tierFilter) {
					delete item.gaming;
				}
				if(item.other && item.other.tier !== tierFilter) {
					delete item.other;
				}
				return item;
			}).filter(item => Object.keys(item).length !== 1);
		}
		result = result.map(item => {
			if(item.finance.vendors.length) {
				item.finance.vendors = item.finance.vendors.filter(vendor => vendor.wordCount);
			}
			if(item.gaming.vendors.length) {
				item.gaming.vendors = item.gaming.vendors.filter(vendor => vendor.wordCount);
			}
			if(item.other.vendors.length) {
				item.other.vendors = item.other.vendors.filter(vendor => vendor.wordCount);
			}
			return item
		});
		return result.filter(vendor => (vendor.finance && vendor.finance.vendors.length)
				|| (vendor.gaming && vendor.gaming.vendors.length)
				|| (vendor.other && vendor.other.vendors.length));
	} catch (err) {
		console.log(err);
		console.log("Error in getXtrfLqaReport");
	}
}

async function getVendorAssessment(assessments, queryIndustry) {
	const result = {
		TQI: [],
	};
	for (let item of assessments) {
		if(item.industries.length) {
			for (let { steps, industry } of item.industries) {
				const { name } = await Industries.findOne({ _id: industry });
				if(name === queryIndustry) {
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

function getFilteringQuery(filters) {
	let query = {
		$and: [{
			documents: { $ne: null },
			creationTime: { $gte: new Date('2020-04-01T00:00:00Z') },
			projectStatus: 'Live',
		}]
	};
	if(filters.nameFilter) {
		query[
				'documents.UserAssignments.TranslationDocumentUserRoleAssignmentDetails.UserInfoHeader.FullName'
				] = { '$regex': new RegExp(`${ filters.nameFilter }`, 'i') };
	}
	if(filters.industryFilter) {
		query.domain = { '$regex': new RegExp(`${ filters.industryFilter }`, 'i') };
	}
	if(filters.targetFilter) {
		query['targetLanguages.lang'] = { $in: filters.targetFilter };
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

module.exports = { rebuildTierReportsStructure, getXtrfLqaReport, getXtrfUpcomingReport };
