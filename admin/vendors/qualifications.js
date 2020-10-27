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
		const findIndex = qualifications.findIndex(
				qualification => qualification.testId.toString() === currentTest._id.toString() &&
						qualification.source.toString() === competence.sourceLanguage._id &&
						qualification.target.toString() === competence.targetLanguage._id
		);
		if(findIndex === -1) {
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
				const ifExistsStepInQualification = isExists(newQualifications[findIndex].industries, competence.industry._id);
				ifExistsStepInQualification || newQualifications[findIndex].industries.push(competence.industry._id);
			}
			const ifExistsStep = isExists(currentTestForItem.steps, competence.step._id);
			if(ifExistsStep) {
				const ifExistsStepInQualification = isExists(newQualifications[findIndex].steps, competence.step._id);
				ifExistsStepInQualification || newQualifications[findIndex].steps.push(competence.step._id);
			}
		}
    console.log('asdasdasdasda');
    rates = checkRedundantRates(oldCompetence, competencies, qualifications, rates);
  } else {
    console.log('tyt');
    rates = await updateVendorRatesFromCompetence(vendorId, competence, oldCompetence);
  }
	return {
		rates,
		qualifications: newQualifications
	};
};


const checkRedundantRates = (competence, allCompetencies, allQualifications, rates) => {
  let { basicPricesTable, stepMultipliersTable, industryMultipliersTable, pricelistTable } = rates;
  const { sourceLanguage, targetLanguage, step, industry } = competence;
  allCompetencies = allCompetencies.filter(row => {
    const sameLanguage = `${row.sourceLanguage} ${row.targetLanguage}` === `${sourceLanguage._id} ${targetLanguage._id}`;
    const sameStep = row.step.toString() === step._id.toString();
    const sameIndustry = row.industry.toString() === industry._id.toString();
    if (!sameLanguage && !sameStep && !sameIndustry) {
      return row;
    }
  });
  allQualifications = allQualifications.filter(({ status }) => status === 'Passed');
  const sameLangPairsIndex = allCompetencies.findIndex(row => (
    `${row.sourceLanguage} ${row.targetLanguage}` === `${sourceLanguage._id} ${targetLanguage._id}`
  ));
  const sameQualificationLangPairIndex = allQualifications.findIndex(({ source, target }) => (
    `${source} ${target}` === `${sourceLanguage._id} ${targetLanguage._id}`
  ))
  const sameStepIndex = allCompetencies.findIndex(row => (
    row.step.toString() === step._id.toString()
  ));
  const sameQualificationStepIndex = allQualifications.findIndex(({ steps }) => (
    steps.map(item => item.toString()).includes(step._id.toString())
  ));
  const sameIndustryIndex = allCompetencies.findIndex(row => (
    row.industry.toString() === industry._id.toString()
  ));
  const sameQualificationIndustryIndex = allQualifications.findIndex(({ industries }) => (
    industries.map(item => item.toString()).includes(industry._id.toString())
  ))

  if ((sameLangPairsIndex === -1 || !allCompetencies.length) && (sameQualificationLangPairIndex === -1 || !allQualifications.length)) {
    basicPricesTable = filterRedundantLangPair(basicPricesTable, sourceLanguage._id, targetLanguage._id);
    pricelistTable = filterRedundantLangPair(pricelistTable, sourceLanguage._id, targetLanguage._id);
  }
  if ((sameStepIndex === -1 || !allCompetencies.length) && (sameQualificationStepIndex === -1 || !allQualifications.length)) {
    stepMultipliersTable = filterRedundantStep(stepMultipliersTable, step._id);
    pricelistTable = filterRedundantStep(pricelistTable, step._id);
  }
  if ((sameIndustryIndex === -1 || !allCompetencies.length) && (sameQualificationIndustryIndex === -1 || !allQualifications.length)) {
    industryMultipliersTable = filterRedundantIndustry(industryMultipliersTable, industry._id);
    pricelistTable = filterRedundantIndustry(pricelistTable, industry._id);
  }

  return {
    basicPricesTable,
    stepMultipliersTable,
    industryMultipliersTable,
    pricelistTable
  }


  function filterRedundantLangPair(arr, sourceLangId, targetLangId) {
    return arr.filter(item => (
      `${item.sourceLanguage} ${item.targetLanguage}` !== `${sourceLangId} ${targetLangId}`
    ));
  }

  function filterRedundantStep (arr, itemId) {
    return arr.filter(item => item.step.toString() !== itemId.toString());
  }

  function filterRedundantIndustry (arr, itemId) {
    return arr.filter(item => item.industry.toString() !== itemId.toString());
  }
}

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
