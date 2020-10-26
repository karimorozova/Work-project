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
			const findIndex = listQualificationsForSave.findIndex(qualification => qualification.testId.toString() === element.testId.toString());
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
	let { qualifications } = await Vendors.findOne({ _id: vendorId });
	let newQualifications = qualifications;
	let currentTest = findSameTest(allTests, competence);
	let rates;
	if(currentTest) {
		const findIndex = qualifications.findIndex(qualification => qualification.testId.toString() === currentTest._id.toString());
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
	}
	rates = await updateVendorRatesFromCompetence(vendorId, competence, oldCompetence);

	return {
		rates,
		qualifications: newQualifications
	};
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
