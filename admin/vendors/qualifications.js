const { Vendors, LangTest } = require('../models');
const { createRateCombinations } = require('./createVendorRates');

const saveQualifications = async (listOfNewCompetencies, vendorId) => {
  const allTests = await LangTest.find({});
  let { qualifications } = await Vendors.findOne({ _id: vendorId });

  let listForRates = [];
  const listCompetenciesForSave = listOfNewCompetencies.filter(competence => {
    const currentTestForItem = allTests.find(test => test.source.toString() === competence.sourceLanguage.toString());
    if (currentTestForItem) {
      const ifExistsTarget = isExists(currentTestForItem.targets, competence.targetLanguage);
      const ifExistsIndustry = isExists(currentTestForItem.industries, competence.industry);
      const ifExistsStep = isExists(currentTestForItem.steps, competence.step);
      if (ifExistsTarget && ifExistsIndustry && ifExistsStep) {
        return competence;
      } else {
        listForRates.push(competence);
      }
    } else {
      listForRates.push(competence);
    }
  });
  let listQualificationsForSave = qualifications;
  listCompetenciesForSave.forEach(element => {
    if (!listQualificationsForSave.length) {
      listQualificationsForSave.push({
        source: element.sourceLanguage,
        target: element.targetLanguage,
        industry: element.industry,
        steps: [element.step],
      });
    } else {
      const findIndex = listQualificationsForSave.findIndex(qualification =>
        qualification.source.toString() === element.sourceLanguage &&
        qualification.target.toString() === element.targetLanguage &&
        qualification.industry.toString() === element.industry
      );
      if (findIndex === -1) {
        listQualificationsForSave.push({
          source: element.sourceLanguage,
          target: element.targetLanguage,
          industry: element.industry,
          steps: [element.step],
        });
      } else {
        const currentTestForItem = allTests.find(test =>
          test.source.toString() === element.sourceLanguage.toString());
        const ifExistsStep = isExists(currentTestForItem.steps, element.step);
        if (ifExistsStep) {
          listQualificationsForSave[findIndex].steps.push(element.step);
        }
      }
    }
  });
  await createRateCombinations(listForRates, vendorId);
  await Vendors.updateOne({ _id: vendorId }, { qualifications: listQualificationsForSave });

  function isExists(arr, searchElement) {
    return arr.map(item => item.toString()).includes(searchElement.toString());
  }
};

module.exports = { saveQualifications };
