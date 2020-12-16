const {Languages, Vendors, Clients, Industries, XtrfLqa} = require('../models');
const readXlsxFile = require('read-excel-file/node');
const ObjectId = require('mongodb').ObjectID;
const {findIndustry} = require('./newLangTierReport');
const {getLqaSpecificTierForVendor} = require('../reports/helpers');
const _ = require('lodash');
const fs = require('fs');

/*
 nameIndex = 0;
 emailIndex = 1;
 stepIndex = 2;
 languagePairIndex = 3;
 industryIndex = 4;
 startDateIndex = 5;
 deadLineIndex = 6;
 projectIdIndex = 7;
 projectNameIndex = 8;
 clientNameIndex = 9;
 wordcountPayablesIndex = 10;
 wordcountReceivablesIndex = 11;
 */
/**
 *
 * @returns nothing - clean old LQA report and fills it with new data
 */
const parseAndWriteLQAReport = async () => {
  const vendors = await Vendors.find();
  const languages = await Languages.find();
  const clients = await Clients.find();
  const allIndustry = await Industries.find()
  const otherIndustry = await Industries.findOne({name: 'Other'})

  let data = [];
  let filesArr = [];
  fs.readdirSync('./static/oldMemoqProjects').forEach(file => {
    filesArr.push(file);
  });
  for (let file of filesArr) {
    const fileData = await readXlsxFile(`./static/oldMemoqProjects/${file}`);
    data.push(...fileData.slice(1));
  }

  let report = data.reduce((acc, cur) => {
    if (cur[10] > 0 && cur[2] === 'translation') {

      acc[cur[3]] = !acc[cur[3]]
        ? getInitialPairInfo(cur)
        : gatherInfo(cur, acc[cur[3]]);
    }
    return acc;
  }, {});
  const newReports = [];

  for (let key of Object.keys(report)) {
    const sourceLangSymbol = key.split(' » ')[0];
    const targetLangSymbol = key.split(' » ')[1];
    const sourceIso = getLangISO1(key, 0);
    const targetIso = getLangISO1(key, 1);
    const sourceLanguage = languages.find(({iso1}) => iso1 === sourceIso)
      || languages.find(({symbol, xtm}) => symbol === sourceLangSymbol || xtm === sourceLangSymbol);
    const targetLanguage = languages.find(({iso1}) => iso1 === targetIso) ||
      languages.find(({symbol, xtm}) => symbol === targetLangSymbol || xtm === targetLangSymbol);
    newReports.push({
      languagePair: getLanguagePair(sourceLanguage, targetLanguage),
      sourceLanguage: sourceLanguage ? ObjectId(sourceLanguage._id) : null,
      targetLanguage: targetLanguage ? ObjectId(targetLanguage._id) : null,
      industries: getResultIndustries(report[key], allIndustry)
    });
  }
  for (let report of newReports) {
    await new XtrfLqa(report).save();
  }
  console.log('Saved!');

  /**
   *
   * @param {Object} vendorsObj
   * @returns {Array} - returns rather empty array or array of vendors
   */
  function getVendorsData(vendorsObj) {
    if (!vendorsObj) return [];
    else {
      const vendorsArr = [];
      for (let vendorKey of Object.keys(vendorsObj)) {
        const vendorInfo = vendorsObj[vendorKey];
        let { name, otherInfo } = vendorInfo;
        const ourVendor = vendors.find(({ aliases }) => aliases.includes(name));
        const ourClient = clients.find(({ aliases }) => aliases.includes(otherInfo.clientName));
        vendorInfo.tier = getLqaSpecificTierForVendor(vendorInfo);
        otherInfo = otherInfo.map(item => {
          if (ourClient) {
            item.clientId = ObjectId(ourClient._id);
          } else {
            item.clientId = null;
          }
          return item;
        });
        vendorsArr.push({
          ...vendorInfo,
          vendorId: ourVendor ? ObjectId(ourVendor._id) : null,
          otherInfo,
        });
      }
      return vendorsArr;
    }
  }

  /**
   *
   * @param {String} langPair
   * @param {Number} langIndex
   * @returns {String} - returns lang's iso
   */
  function getLangISO1(langPair, langIndex) {
    const langPairArr = langPair.split(' » ');
    let langIso = langPairArr[langIndex].split('-');
    langIso[0] = langIso[0].toLowerCase();
    langIso = langIso.join('-');
    return langIso;
  }

  /**
   *
   * @param {Array} cur
   * @returns {Object} - returns info about industry
   */
  function getInitialPairInfo(cur) {
    const industry = cur[4];
    const startDate = getCorrectTime(cur[5]);
    const deadline = getCorrectTime(cur[6]);
    return {
      [industry]: {
        [cur[0]]: {
          name: cur[0],
          email: cur[1],
          wordCount: cur[10],
          otherInfo: [{
            clientName: cur[9],
            startDate,
            deadline,
            projectId: cur[7],
            wordcountPayables: cur[10],
            wordcountReceivables: cur[11]
          }]
        }
      }
    };
  }

  function gatherInfo (cur, languagePairData) {
    let result = {};

    for (let a of Object.keys(languagePairData)){
      result[a] = languagePairData[a]
    }

    result[cur[4]] = getIndustryData(languagePairData[cur[4]], cur);

    return result;
  }

  function getIndustryData (industry, cur) {
    const startDate = getCorrectTime(cur[5]);
    const deadline = getCorrectTime(cur[6]);
    const newOtherInfo = {
      clientName: cur[9],
      startDate,
      deadline,
      projectId: cur[7],
      wordcountPayables: cur[10],
      wordcountReceivables: cur[11]
    };
    const vendor = industry ? Object.keys(industry).find(key => key === cur[0]) : null;
    let industryData;
    if (vendor) {
      const { otherInfo } = industry[vendor];
      otherInfo.push(newOtherInfo);
      industryData = {
        ...industry,
        [vendor]: {
          name: cur[0],
          email: cur[1],
          wordCount: +(industry[vendor].wordCount + cur[10]).toFixed(2),
          otherInfo,
        },
      };
    } else {
      industryData = industry ? {
          ...industry,
          [cur[0]]: {
            name: cur[0],
            email: cur[1],
            wordCount: cur[10],
            otherInfo: [{
              clientName: cur[9],
              startDate,
              deadline,
              projectId: cur[7],
              wordcountPayables: cur[10],
              wordcountReceivables: cur[11]
            }]
          },
        }
        :
        {
          [cur[0]]: {
            name: cur[0],
            email: cur[1],
            wordCount: cur[10],
            otherInfo: [{
              clientName: cur[9],
              startDate,
              deadline,
              projectId: cur[7],
              wordcountPayables: cur[10],
              wordcountReceivables: cur[11]
            }]
          }
        };
    }
    return industryData;
  }

  function getCorrectTime(dateString) {
    let dateArr = dateString.split(' ');
    dateArr.pop();
    dateArr = dateArr.join('T');
    return new Date(dateArr);
  }

  function getResultIndustries(vendor, allIndustries) {
    let industries = [];
    for (let industryName of Object.keys(vendor)){

      const vendorIndustry =  _.find(allIndustries, {name: industryName}) || otherIndustry;
      const vendorIndustryGroup =  _.find(allIndustries, {name: findIndustry(industryName)}) || otherIndustry;

      industries.push({
        industry: ObjectId(vendorIndustry._id),
        industryGroup: ObjectId(vendorIndustryGroup._id),
        vendors: getVendorsData(vendor[industryName])
      })
    }
    return industries;
  }

  function getLanguagePair(sourceLanguage, targetLanguage) {
    // console.log(sourceLanguage.lang || 'null', targetLanguage.lang || 'null')
    const sourceLang = sourceLanguage ? sourceLanguage.lang : 'No Data'
    const targetLang = targetLanguage ? targetLanguage.lang : 'No Data'
    return sourceLang + " >> " + targetLang
  }
};

module.exports = {
  parseAndWriteLQAReport
};
