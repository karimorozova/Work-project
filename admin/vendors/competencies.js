const { Vendors } = require('../models');
const { getVendor, getVendorAfterUpdate } = require('./getVendors');
const ObjectId = require('mongodb').ObjectID;
const { saveQualifications, saveQualificationsAfterUpdateCompetencies } = require('./qualifications');
const { deleteVendorRates } = require('./deleteVendorRates');

const updateVendorCompetencies = async (vendorId, dataToUpdate) => {
	try {
		let { competencies } = await getVendor({ _id: vendorId });
		if(dataToUpdate._id) {
			const neededServiceIndex = competencies.findIndex(item => item._id.toString() === dataToUpdate._id);
			const oldCompetence = competencies[neededServiceIndex];
			competencies.splice(neededServiceIndex, 1, generateCompetenceForSave(dataToUpdate));
			const { rates, qualifications } = await saveQualificationsAfterUpdateCompetencies(dataToUpdate, vendorId, oldCompetence);
			return getVendorAfterUpdate({ _id: vendorId }, { competencies, rates, qualifications });
		} else {
			const combinationsWithoutRepetitions = generateCompetenciesCombinations(dataToUpdate)
					.filter(x => competencies.every(y =>
							`${ x.sourceLanguage }/${ x.targetLanguage }/${ x.industry }/${ x.step }` !==
							`${ y.sourceLanguage._id }/${ y.targetLanguage._id }/${ y.industry._id }/${ y.step._id }`
					));
			competencies.push(...combinationsWithoutRepetitions);
			const { rates, qualifications } = await saveQualifications(combinationsWithoutRepetitions, vendorId);

			await Vendors.updateOne({ _id: vendorId }, { competencies, rates, qualifications });
			return await Vendors.findOne({ _id: vendorId }).populate([
				'competencies.sourceLanguage',
				'competencies.targetLanguage',
				'competencies.industry',
				'competencies.step'
			]);
		}
	} catch (err) {
		console.log(err);
		console.log('Error in updateVendorCompetencies');
	}

	function generateCompetenceForSave(dataToUpdate) {
		let dataToSave = {};
		for (const key in dataToUpdate) {
			if(dataToUpdate.hasOwnProperty(key)) {
				const element = dataToUpdate[key];
				dataToSave[key] = ObjectId(element._id);
			}
		}
		return dataToSave;
	}
};

const generateCompetenciesCombinations = (dataToUpdate) => {
	const competenciesCombinations = [];
	const competenciesDataIds = {
		sourceLanguage: [ObjectId(dataToUpdate.sourceLanguage._id)],
		targetLanguage: dataToUpdate.targetLanguage.map(item => ObjectId(item._id)),
		step: dataToUpdate.step.map(item => ObjectId(item._id)),
		industry: dataToUpdate.industry.map(item => ObjectId(item._id)),
	};
	competenciesDataIds.sourceLanguage.forEach(sourceLanguage => {
		competenciesDataIds.targetLanguage.forEach(targetLanguage => {
			competenciesDataIds.step.forEach(step => {
				competenciesDataIds.industry.forEach(industry => {
					competenciesCombinations.push({ sourceLanguage, targetLanguage, step, industry });
				});
			});
		});
	});
	return competenciesCombinations;
};

const deleteVendorCompetencies = async (vendorId, competenceId) => {
	try {
		const { competencies } = await Vendors.findOne({ _id: vendorId });
		const neededIndex = competencies.findIndex(item => item._id.toString() === competenceId);
		const { rates } = await deleteVendorRates(vendorId, competencies[neededIndex]);
		competencies.splice(neededIndex, 1);
		await Vendors.updateOne({ _id: vendorId }, { competencies, rates });
		return await Vendors.findOne({ _id: vendorId });
	} catch (err) {
		console.log(err);
		console.log('Error in deleteVendorCompetencies');
	}
};

module.exports = { updateVendorCompetencies, deleteVendorCompetencies, generateCompetenciesCombinations };
