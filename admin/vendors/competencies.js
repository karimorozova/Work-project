const { Vendors } = require('../models');
const { getVendor } = require('./getVendors');
const ObjectId = require('mongodb').ObjectID;
const { saveQualifications } = require('./qualifications');
const { updateVendorRatesFromCompetence } = require('./newUpdateVendorRates');
const { deleteVendorRates } = require('./deleteVendorRates');

const updateVendorCompetencies = async (vendorId, dataToUpdate) => {
  try {
    let { competencies } = await getVendor({ _id: vendorId });
    if (dataToUpdate._id) {
      const neededServiceIndex = competencies.findIndex(item => item._id.toString() === dataToUpdate._id);
      const oldCompetencyExample = competencies[neededServiceIndex];
      competencies.splice(neededServiceIndex, 1, generateCompetenceForSave(dataToUpdate));
      await Vendors.updateOne({ _id: vendorId }, { competencies });
      await updateVendorRatesFromCompetence(vendorId, dataToUpdate, oldCompetencyExample);
    } else {
      const combinationsWithoutRepetitions = generateCompetenciesCombinations(dataToUpdate)
        .filter(x => competencies.every(y =>
          `${x.sourceLanguage}/${x.targetLanguage}/${x.industry}/${x.step}` !==
          `${y.sourceLanguage}/${y.targetLanguage}/${y.industry}/${y.step}`
        ));
      competencies.push(...combinationsWithoutRepetitions);
      await Vendors.updateOne({ _id: vendorId }, { competencies });
      await saveQualifications(combinationsWithoutRepetitions, vendorId);
    }
  } catch (err) {
    console.log(err);
    console.log('Error in updateVendorCompetencies');
  }

  function generateCompetenceForSave(dataToUpdate) {
    let dataToSave = {};
    for (const key in dataToUpdate) {
      if (dataToUpdate.hasOwnProperty(key)) {
        const element = dataToUpdate[key];
        dataToSave[key] = ObjectId(element._id);
      }
    }
    return dataToSave;
  }

  function generateCompetenciesCombinations(dataToUpdate) {
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
  }

};

const deleteVendorCompetencies = async (vendorId, competenceId) => {
  try {
    const { competencies } = await Vendors.findOne({ _id: vendorId });
    const neededIndex = competencies.findIndex(item => item._id.toString() === competenceId);
    await deleteVendorRates(vendorId, competencies[neededIndex]);
    competencies.splice(neededIndex, 1);
    await Vendors.updateOne({ _id: vendorId }, { competencies });
  } catch (err) {
    console.log(err);
    console.log('Error in deleteVendorCompetencies');
  }
};

module.exports = { updateVendorCompetencies, deleteVendorCompetencies };
