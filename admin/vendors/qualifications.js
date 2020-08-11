const { Vendors, LangTest } = require('../models');
const { createRateCombinations } = require('./createVendorRates');


const saveQualifications = async (listOfNewCompetencies, vendorId) => {
  const allTests = await LangTest.find({});
  let { qualifications } = await Vendors.findOne({ _id: vendorId });

  let listForRates = [];
  const listCompetenciesForSave = listOfNewCompetencies.filter(competence => {
    let currentTest = allTests.find(test =>
      test.source.toString() === competence.sourceLanguage.toString() &&
      test.targets.find(target => target.toString() === competence.targetLanguage.toString()) &&
      test.industries.find(industry => industry.toString() === competence.industry.toString()) &&
      test.steps.find(step => step.toString() === competence.step.toString())
    );
    if (currentTest) {
      return competence
    } else {
      listForRates.push(competence)
    }
  })

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

  await Vendors.updateOne(
    { _id: vendorId },
    { qualifications: qualificationsArrayAdditions(listQualificationsForSave, allTests) }
  );
  await createRateCombinations(listForRates, vendorId);

  function qualificationsArrayAdditions(qualificationsArray, testsArray) {
    let finalQualifivationArray = [];
    qualificationsArray.forEach(qualification => {
      let currentTest = testsArray.find(test =>
        test.source.toString() === qualification.source.toString() &&
        test.targets.find(target => target.toString() === qualification.target.toString()) &&
        test.industries.find(industry => industry.toString() === qualification.industry.toString()) &&
        test.steps.find(step =>
          qualification.steps.some((currentStep) => step.toString() === currentStep.toString())
        )
      );
      let currentQualification = {}
      Object.assign(currentQualification, qualification.toJSON());
      currentQualification.testType = currentTest.evaluationType === 'Test' ? 'Test' : 'Sample';
      finalQualifivationArray.push(currentQualification)
    });
    return finalQualifivationArray;
  }

  function isExists(arr, searchElement) {
    return arr.map(item => item.toString()).includes(searchElement.toString());
  }
};

module.exports = { saveQualifications };