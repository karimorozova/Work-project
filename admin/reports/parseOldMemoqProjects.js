const { Languages, Vendors, Clients, Industries } = require('../models');
const readXlsxFile = require('read-excel-file/node');
const fs = require('fs');

// File location: ./static/oldMemoqProjects/1.xlsx

const readFile = async () => {
  const vendors = await Vendors.find();
  const languages = await Languages.find();
  const clients = await Clients.find();
  const financeIndustry = await Industries.find({ name: 'Finance' });
  const igamingIndustry = await Industries.find({ name: 'iGaming (Casino, Slot games, Gambling, etc.)' });
  let data = [];
  readXlsxFile('./static/oldMemoqProjects/1.xlsx').then((rows) => {
    data = rows.reduce((acc, curr, index) => {
      const languagePair = curr[2];
      const name = curr[0];
      const email = curr[1];
      const sourceLanguage = languagePair.split(' » ')[0];
      const targetLanguage = languagePair.split(' » ')[1];
      const industry = curr[4];
      const startDate = curr[5].split(' ')[0];
      const deadline = curr[6].split(' ')[0];
      const projectId = curr[7];
      const projectName = curr[8];
      const clientName = curr[9];
      const wordcountPayables = curr[10];
      const wordcountReceivables = curr[11];
      if (index !== 0) {
        acc.push(acc[languagePair] && (industry === 'Finance' || industry === 'iGaming') ?
          {
            ...acc[name],
            industries: [
              ...acc[industries],

            ],
            wordcount: acc[wordcount] + wordcountPayables,
            industry,
            otherInfo: [...acc[otherInfo],
              {
                projectId,
                projectName,
                clientName,
                startDate,
                deadline,
                wordcountReceivables,
                wordcountPayables,
              }
            ]
          }
          :
          {
            sourceLanguage,
            targetLanguage,
            industries: [{
              industry: industry === 'Finance' ? financeIndustry : igamingIndustry,
              vendors: [{
                vendorId: vendors.find(({ aliases }) => aliases.includes(name)) || null,
                name,
                email,
                wordcount: wordcountPayables,
                otherInfo: [{
                  projectId,
                  projectName,
                  clientId: clients.find(({ aliases }) => aliases.includes(clientName)) || null,
                  clientName,
                  startDate,
                  deadline,
                  wordcountReceivables,
                  wordcountPayables,
                }]
              }],
            }],
            name,
            wordcount: wordcountPayables,
            industry,
            otherInfo: [
              {
                projectId,
                projectName,
                clientName,
                startDate,
                deadline,
                wordcountReceivables,
                wordcountPayables,
              }
            ]
          });
      }
      return acc;
    }, []);
    for (let { name, otherInfo } of data) {

    }
  });
};

module.exports = {
  readFile
};
