const { Vendors, LangTest } = require('../models');
const { createRateCombinations } = require('./createVendorRates');
const { updateVendorRatesFromCompetence } = require('./updateVendorRates');

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
      return competence;
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
        qualification.source.toString() === element.sourceLanguage.toString() &&
        qualification.target.toString() === element.targetLanguage.toString() &&
        qualification.industry.toString() === element.industry.toString()
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
          test.source.toString() === element.sourceLanguage.toString() &&
          test.targets.find(target => target.toString() === element.targetLanguage.toString()) &&
          test.industries.find(industry => industry.toString() === element.industry.toString()) &&
          test.steps.find(step => step.toString() === element.step.toString())
        );
        const ifExistsStep = isExists(currentTestForItem.steps, element.step);
        if (ifExistsStep) {
          const ifExistsStepInQualification = isExists(listQualificationsForSave[findIndex].steps, element.step);
          ifExistsStepInQualification || listQualificationsForSave[findIndex].steps.push(element.step);
        }
      }
    }
  });
  const rates = await createRateCombinations(listForRates, vendorId);
  return {
    rates,
    qualifications: qualificationsArrayAdditions(listQualificationsForSave, allTests),
  };

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
      if (!qualification.hasOwnProperty('testType') || qualification.testType == '') {
        let currentQualification = {};
        Object.assign(currentQualification, qualification.toJSON());
        currentQualification.testType = currentTest.evaluationType === 'Test' ? 'Test' : 'Sample';
        finalQualifivationArray.push(currentQualification);
      } else {
        finalQualifivationArray.push(qualification.toJSON());
      }
    });
    return finalQualifivationArray;
  }
};

const saveQualificationsAfterUpdateCompetencies = async (competence, vendorId, oldCompetence) => {
  const allTests = await LangTest.find({});
  let { qualifications } = await Vendors.findOne({ _id: vendorId });
  let newQualifications = qualifications;
  let rates = [];
  currentTest = allTests.find(test =>
    test.source.toString() === competence.sourceLanguage._id &&
    test.targets.find(target => target.toString() === competence.targetLanguage._id) &&
    test.industries.find(industry => industry.toString() === competence.industry._id) &&
    test.steps.find(step => step.toString() === competence.step._id)
  );
  if (currentTest) {
    const findIndex = qualifications.findIndex(qualification =>
      qualification.source.toString() === competence.sourceLanguage._id &&
      qualification.target.toString() === competence.targetLanguage._id &&
      qualification.industry.toString() === competence.industry._id
    );
    if (findIndex === -1) {
      newQualifications.push({
        source: competence.sourceLanguage,
        target: competence.targetLanguage,
        industry: competence.industry,
        steps: [competence.step],
        testType: currentTest.evaluationType,
      });
    } else {
      const currentTestForItem = allTests.find(test =>
        test.source.toString() === competence.sourceLanguage._id &&
        test.targets.find(target => target.toString() === competence.targetLanguage._id) &&
        test.industries.find(industry => industry.toString() === competence.industry._id) &&
        test.steps.find(step => step.toString() === competence.step._id)
      );
      const ifExistsStep = isExists(currentTestForItem.steps, competence.step._id);
      if (ifExistsStep) {
        const ifExistsStepInQualification = isExists(newQualifications[findIndex].steps, competence.step._id);
        ifExistsStepInQualification || newQualifications[findIndex].steps.push(competence.step._id);
      }
    }
  } else {
    rates = await updateVendorRatesFromCompetence(vendorId, competence, oldCompetence);
  }
  return {
    rates,
    qualifications: newQualifications
  };
};

const isExists = (arr, searchElement) => {
  return arr.map(item => item.toString()).includes(searchElement.toString());
};

module.exports = { saveQualifications, saveQualificationsAfterUpdateCompetencies };
