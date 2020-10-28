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
		if(currentTest) {
			competence.testId = currentTest._id;
			return competence;
		} else {
			listForRates.push(competence);
		}
	});

	let listQualificationsForSave = qualifications;

	listCompetenciesForSave.forEach(element => {
		if(!listQualificationsForSave.length) {
			listQualificationsForSave.push(pushFirstQualification(element));
		} else {
			const findIndex = listQualificationsForSave.findIndex(
					qualification => qualification.testId.toString() === element.testId.toString() &&
							qualification.source.toString() === element.sourceLanguage.toString() &&
							qualification.target.toString() === element.targetLanguage.toString()
			);
			if(findIndex === -1) {
				listQualificationsForSave.push(pushFirstQualification(element));
			} else {
				const currentTestForItem = allTests.find((test) => test._id === element.testId);
				const ifExistsStep = isExists(currentTestForItem.steps, element.step);
				const ifExistsIndustry = isExists(currentTestForItem.industries, element.industry);

				if(ifExistsIndustry) {
					const ifExistsIndustryInQualification = isExists(listQualificationsForSave[findIndex].industries, element.industry);
					ifExistsIndustryInQualification || listQualificationsForSave[findIndex].industries.push(element.industry);
					if(listQualificationsForSave[findIndex].status === 'Passed') {
						listForRates.push(element);
					}
				}
				if(ifExistsStep) {
					const ifExistsStepInQualification = isExists(listQualificationsForSave[findIndex].steps, element.step);
					ifExistsStepInQualification || listQualificationsForSave[findIndex].steps.push(element.step);
					if(listQualificationsForSave[findIndex].status === 'Passed') {
						listForRates.push(element);
					}
				}
			}
		}
	});
	const rates = await createRateCombinations(listForRates, vendorId);

	return { rates, qualifications: qualificationsArrayAdditions(listQualificationsForSave, allTests) };

	function qualificationsArrayAdditions(qualificationsArray, testsArray) {
		let finalQualificationArray = [];
		qualificationsArray.forEach(qualification => {
			let currentTest = testsArray.find(test =>
					test.source.toString() === qualification.source.toString() &&
					test.targets.find(target => target.toString() === qualification.target.toString()) &&
					test.industries.find(industry => qualification.industries.some(currInd => industry.toString() === currInd.toString())) &&
					test.steps.find(step => qualification.steps.some((currentStep) => step.toString() === currentStep.toString()))
			);
			if(!qualification.hasOwnProperty('testType') || qualification.testType === '') {
				let currentQualification = {};
				Object.assign(currentQualification, qualification.toJSON());
				currentQualification.testType = currentTest.evaluationType === 'Test' ? 'Test' : 'Sample';
				finalQualificationArray.push(currentQualification);
			} else {
				finalQualificationArray.push(qualification.toJSON());
			}
		});
		return finalQualificationArray;
	}
};

const saveQualificationsAfterUpdateCompetencies = async (competence, vendorId, oldCompetence) => {
	const allTests = await LangTest.find({});
	let { qualifications, rates, competencies } = await Vendors.findOne({ _id: vendorId });
	let newQualifications = qualifications;
	let currentTest = findSameTest(allTests, competence);
  if(currentTest) {
		const neededQualificationIndex = qualifications.findIndex(
				qualification => qualification.testId.toString() === currentTest._id.toString() &&
						qualification.source.toString() === competence.sourceLanguage._id &&
						qualification.target.toString() === competence.targetLanguage._id
		);
		if(neededQualificationIndex === -1) {
			newQualifications.push({
				source: competence.sourceLanguage,
				target: competence.targetLanguage,
				industries: [competence.industry],
				steps: [competence.step],
				testId: currentTest._id.toString(),
				testType: currentTest.evaluationType,
			});
		} else {
      const currentTestForItem = allTests.find((test) => test._id.toString() === currentTest._id.toString());
			const ifExistsIndustry = isExists(currentTestForItem.industries, competence.industry._id);
			if(ifExistsIndustry) {
				const ifExistsStepInQualification = isExists(newQualifications[neededQualificationIndex].industries, competence.industry._id);
				ifExistsStepInQualification || newQualifications[neededQualificationIndex].industries.push(competence.industry._id);
			}
			const ifExistsStep = isExists(currentTestForItem.steps, competence.step._id);
			if(ifExistsStep) {
				const ifExistsStepInQualification = isExists(newQualifications[neededQualificationIndex].steps, competence.step._id);
				ifExistsStepInQualification || newQualifications[neededQualificationIndex].steps.push(competence.step._id);
			}
		}
		const neededCompetencies = getCompetenciesForCheck(competencies);
		if (neededCompetencies.length) {
      const langPairsToDelete = [];
      const industriesToDelete = [];
      const stepsToDelete = [];
      for (let { sourceLanguage, targetLanguage, industry, step } of neededCompetencies) {
        const oldCompetenceLangPair = `${oldCompetence.sourceLanguage._id} ${oldCompetence.targetLanguage._id}`;
        const doesHaveSameLangPair = `${sourceLanguage} ${targetLanguage}` === oldCompetenceLangPair;
        const doesHaveSameStep = step.toString() === oldCompetence.step._id.toString();
        const doesHaveSameIndustry = industry.toString() === oldCompetence.industry._id.toString();
        if (!doesHaveSameLangPair) langPairsToDelete.push(oldCompetenceLangPair);
        if (!doesHaveSameStep) stepsToDelete.push(oldCompetence.step._id.toString());
        if (!doesHaveSameIndustry) industriesToDelete.push(oldCompetence.industry._id.toString());
      }
      rates.basicPricesTable = rates.basicPricesTable.filter(row => (
        !langPairsToDelete.includes(`${row.sourceLanguage} ${row.targetLanguage}`)
      ));
      rates.stepMultipliersTable = rates.stepMultipliersTable.filter(row => !stepsToDelete.includes(row.step.toString()));
      rates.industryMultipliersTable = rates.industryMultipliersTable.filter(row => (
        !industriesToDelete.includes(row.industry.toString())
      ));
      rates.pricelistTable = rates.pricelistTable.filter(row => (
        !langPairsToDelete.includes(`${row.sourceLanguage} ${row.targetLanguage}`) &&
        !stepsToDelete.includes(row.step.toString()) &&
        !industriesToDelete.includes(row.industry.toString())
      ))
    } else {
		  rates = {
		    basicPricesTable: [],
        stepMultipliersTable: [],
        industryMultipliersTable: [],
        pricelistTable: []
      }
    }
  } else {
    rates = await updateVendorRatesFromCompetence(vendorId, competence, oldCompetence);
  }
  return {
    rates,
    qualifications: newQualifications
  };

  function getCompetenciesForCheck(competencies) {
    return competencies.filter(row => {
      const { sourceLanguage, targetLanguage, industry, step, _id } = row;
      const qualificationLangPairs = newQualifications.map(row => `${row.source} ${row.target}`);
      const qualificationSteps = newQualifications.map(row => [...row.steps]);
      const qualificationIndustries = newQualifications.map(row => [...row.industries]);
      const doesHaveLangPair = qualificationLangPairs.includes(`${sourceLanguage} ${targetLanguage}`);
      const doesHaveStep = qualificationSteps.includes(step);
      const doesHaveIndustry = qualificationIndustries.includes(industry);
      const doesHaveSameId = competence._id.toString() === _id.toString();
      if (!doesHaveLangPair && !doesHaveStep && !doesHaveIndustry && !doesHaveSameId) {
        return row;
      }
    });
  }
};

const findSameTest = (arrTest, competence) => {
	return arrTest.find(test =>
			test.source.toString() === competence.sourceLanguage._id &&
			test.targets.find(target => target.toString() === competence.targetLanguage._id) &&
			test.industries.find(industry => industry.toString() === competence.industry._id) &&
			test.steps.find(step => step.toString() === competence.step._id)
	);
};

const pushFirstQualification = (element) => {
	return {
		source: element.sourceLanguage,
		target: element.targetLanguage,
		industries: [element.industry],
		steps: [element.step],
		testId: element.testId
	}
};

const isExists = (arr, searchElement) => {
	return arr.map(item => item.toString()).includes(searchElement.toString());
};

module.exports = { saveQualifications, saveQualificationsAfterUpdateCompetencies };
