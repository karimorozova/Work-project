const { Vendors, LangTest } = require('../models');
const { createRateCombinations } = require('./createVendorRates');
const { updateVendorRatesFromCompetence } = require('./updateVendorRates');
const { getCompetenciesForCheck } = require('./helpers');

const saveQualifications = async (listOfNewCompetencies, vendorId) => {
	const allTests = await LangTest.find({});
	let { qualifications } = await Vendors.findOne({ _id: vendorId });
	let listForRates = [];
	const listCompetenciesForSave = listOfNewCompetencies.filter(competence => {
		let currentTest = findSameTestFromCompetence(allTests, competence);
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
				if(ifExistsIndustry) qualificationStatusPassed('industries', 'industry');
				if(ifExistsStep) qualificationStatusPassed('steps', 'step');

				function qualificationStatusPassed(arr, key) {
					isExists(listQualificationsForSave[findIndex][arr], element[key]) || listQualificationsForSave[findIndex][arr].push(element[key]);
					if(listQualificationsForSave[findIndex].status === 'Passed') listForRates.push(element);
				}
			}
		}
	});

	const rates = await createRateCombinations(listForRates, vendorId);

	return { rates, qualifications: qualificationsArrayAdditions(listQualificationsForSave, allTests) };

	function qualificationsArrayAdditions(qualificationsArray, testsArray) {
		let finalQualificationArray = [];
		qualificationsArray.forEach(qualification => {
			let currentTest = findSameTestFromQualification(testsArray, qualification);
			if(currentTest && (!qualification.hasOwnProperty('testType') || qualification.testType === '')) {
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
	let currentTest = findSameTestFromCompetence(allTests, competence, true);
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
		const neededCompetencies = getCompetenciesForCheck(competencies, oldCompetence._id, allTests);
		if(neededCompetencies.length) {
			const langPairsToDelete = [];
			const industriesToDelete = [];
			const stepsToDelete = [];
			for (let { sourceLanguage, targetLanguage, industry, step } of neededCompetencies) {
				const oldCompetenceLangPair = `${ oldCompetence.sourceLanguage._id } ${ oldCompetence.targetLanguage._id }`;
				const doesHaveSameLangPair = `${ sourceLanguage } ${ targetLanguage }` === oldCompetenceLangPair;
				const doesHaveSameStep = step.toString() === oldCompetence.step._id.toString();
				const doesHaveSameIndustry = industry.toString() === oldCompetence.industry._id.toString();
				if(!doesHaveSameLangPair) langPairsToDelete.push(oldCompetenceLangPair);
				if(!doesHaveSameStep) stepsToDelete.push(oldCompetence.step._id.toString());
				if(!doesHaveSameIndustry) industriesToDelete.push(oldCompetence.industry._id.toString());
			}
			rates.basicPricesTable = rates.basicPricesTable.filter(row => (
					!langPairsToDelete.includes(`${ row.sourceLanguage } ${ row.targetLanguage }`)
			));
			rates.stepMultipliersTable = rates.stepMultipliersTable.filter(row => !stepsToDelete.includes(row.step.toString()));
			rates.industryMultipliersTable = rates.industryMultipliersTable.filter(row => (
					!industriesToDelete.includes(row.industry.toString())
			));
			rates.pricelistTable = rates.pricelistTable.filter(row => (
					!langPairsToDelete.includes(`${ row.sourceLanguage } ${ row.targetLanguage }`) &&
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
};

const findSameTestFromQualification = (arrTest, qualification) => {
	return arrTest.find(test =>
			test.source.toString() === qualification.source.toString() &&
			test.targets.find(target => target.toString() === qualification.target.toString()) &&
			test.industries.find(industry => qualification.industries.some(currInd => industry.toString() === currInd.toString())) &&
			test.steps.find(step => qualification.steps.some((currentStep) => step.toString() === currentStep.toString()))
	);
};

const findSameTestFromCompetence = (arrTest, competence, includesId = false) => {
	let { sourceLanguage, targetLanguage, industry, step } = competence;
	if(includesId) {
		sourceLanguage = sourceLanguage._id;
		targetLanguage = targetLanguage._id;
		industry = industry._id;
		step = step._id;
	}
	return arrTest.find(test =>
			test.source.toString() === sourceLanguage.toString() &&
			test.targets.find(target => target.toString() === targetLanguage.toString()) &&
			test.industries.find(testIndustry => testIndustry.toString() === industry.toString()) &&
			test.steps.find(testStep => testStep.toString() === step.toString())
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
