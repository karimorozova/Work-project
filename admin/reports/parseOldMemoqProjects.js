const { Languages, Vendors, Clients, Industries, XtrfLqa } = require('../models');
const readXlsxFile = require('read-excel-file/node');
const ObjectId = require('mongodb').ObjectID;
const { findIndustry } = require('./newLangTierReport');
const fs = require('fs');

const parseAndWriteLQAReport = async () => {
  let filesArr = [];
  fs.readdirSync('./static/oldMemoqProjects').forEach(file => {
    filesArr.push(file);
  });
  for (let file of filesArr) {
    await parseFiles(file);
  }

  async function parseFiles (fileName) {
    const reports = await XtrfLqa.find();
    if (reports.length) await XtrfLqa.remove();
    const vendors = await Vendors.find();
    const languages = await Languages.find();
    const clients = await Clients.find();
    const financeIndustry = await Industries.findOne({ name: 'Finance' });
    const igamingIndustry = await Industries.findOne({ name: 'iGaming' });
    let data = [];
    readXlsxFile(`./static/oldMemoqProjects/${fileName}`).then(async (rows) => {
      data.push(rows.reduce((acc, curr, index) => {
        const languagePair = curr[3];
        const name = curr[0];
        const email = curr[1];
        const step = curr[2];
        if (languagePair) {
          const sourceSymbol = languagePair.split(' » ')[0];
          const targetSymbol = languagePair.split(' » ')[1];
          const sourceLanguage = languages.find(({ symbol, xtm, iso1, iso2 }) => (
            sourceSymbol === symbol || sourceSymbol === xtm || sourceSymbol === iso1 || sourceSymbol === iso2
          ));
          const targetLanguage = languages.find(({ symbol, xtm, iso1, iso2 }) => (
            targetSymbol === symbol || targetSymbol === xtm || targetSymbol === iso1 || targetSymbol === iso2
          ));
          let industry = curr[4];
          const startDate = curr[5].split(' ')[0];
          const deadline = curr[6].split(' ')[0];
          const projectId = curr[7];
          const projectName = curr[8];
          const clientName = curr[9];
          const wordcountPayables = curr[10];
          const wordcountReceivables = curr[11];
          const ourVendor = vendors.find(({ aliases }) => aliases.includes(name));
          const ourClient = clients.find(({ aliases }) => aliases.includes(clientName));
          const otherInfo = {
            projectId,
            projectName,
            clientId: ourClient ? ObjectId(ourClient._id) : null,
            clientName: ourClient ? ourClient.name : clientName,
            startDate,
            deadline,
            wordcountReceivables,
            wordcountPayables,
          };
          const newVendorObj = {
            vendorId: ourVendor ? ObjectId(ourVendor._id) : null,
            name,
            email,
            wordCount: +wordcountPayables,
            otherInfo: [{
              ...otherInfo
            }]
          };
          industry = findIndustry(industry);
          if (index !== 0 && step === 'translation') {
            if (acc[languagePair]) {
              industry = industry === 'Finance' ? ObjectId(financeIndustry._id) : ObjectId(igamingIndustry._id);
              const neededIndustryIndex = acc[languagePair].industries.findIndex(item => (
                item.industry.toString() === industry.toString()
              ));
              const neededVendorIndex = neededIndustryIndex !== -1 ?
                acc[languagePair].industries[neededIndustryIndex].vendors.findIndex(vendor => vendor.name === name) : -1;
              const newIndustryObj = {
                industry: industry === 'Finance' ? ObjectId(financeIndustry._id) : ObjectId(igamingIndustry._id),
                vendors: [{
                  ...newVendorObj
                }],
              };
              if (neededIndustryIndex !== -1 && neededVendorIndex !== -1) {
                let wordCount = acc[languagePair].industries[neededIndustryIndex].vendors[neededVendorIndex].wordCount;
                acc[languagePair].industries[neededIndustryIndex].vendors[neededVendorIndex].wordCount =
                  Number((+wordCount + +wordcountPayables).toFixed(2));
                acc[languagePair].industries[neededIndustryIndex].vendors[neededVendorIndex].otherInfo.push(otherInfo);
              } else if (neededIndustryIndex !== -1 && neededVendorIndex === -1) {
                acc[languagePair].industries[neededIndustryIndex].vendors.push(newVendorObj);
              } else if (neededIndustryIndex === -1 && neededVendorIndex === -1) {
                console.log(1);
                acc[languagePair].industries.push(newIndustryObj);
              }
            } else {
              acc[languagePair] = {
                sourceLanguage,
                targetLanguage,
                industries: [{
                  industry: industry === 'Finance' ? ObjectId(financeIndustry._id) : ObjectId(igamingIndustry._id),
                  vendors: [{
                    ...newVendorObj
                  }],
                }],
              };
            }
          }
        }
        return acc;
      }, {}));
      data = data.reduce((acc, curr) => {
        acc.push(...Object.values(curr));
        return acc;
      }, []);
      console.log('Written to array');
      for (let row of data) {
        await XtrfLqa(row).save();
      }
      console.log('Saved!');
    });
	}
};

module.exports = {
	parseAndWriteLQAReport
};
