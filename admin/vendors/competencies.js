const { Vendors } = require('../models');
const ObjectId = require('mongodb').ObjectID;

const updateVendorCompetencies = async (vendorId, dataToUpdate) => {
  try {
    let { competencies } = await Vendors.findOne({ _id: vendorId });

    const dataForSave = {
      sourceLanguage: ObjectId(dataToUpdate.sourceLanguage._id),
      targetLanguages: dataToUpdate.targetLanguages.map(item => ObjectId(item._id)),
      steps: dataToUpdate.steps.map(item => ObjectId(item._id)),
      industries: dataToUpdate.industries.map(item => ObjectId(item._id)),
    }
    if (dataToUpdate._id) {
      const neededServiceIndex = competencies.findIndex(item => item._id.toString() === dataToUpdate._id);
      competencies.splice(neededServiceIndex, 1, dataForSave);
      await Vendors.updateOne({ _id: vendorId }, { competencies });
    } else {
      competencies.push(dataForSave);
      await Vendors.updateOne({ _id: vendorId }, { competencies });
    }
  } catch (err) {
    console.log(err);
    console.log('Error in updateVendorCompetencies');
  }
};

const deleteVendorCompetencies = async (vendorId, competenceId) => {
  try {
    const { competencies } = await Vendors.findOne({ _id: vendorId });
    const neededIndex = competencies.findIndex(item => item._id.toString() === competenceId);
    competencies.splice(neededIndex, 1);
    await Vendors.updateOne({ _id: vendorId }, { competencies });
  } catch (err) {
    console.log(err);
    console.log('Error in deleteVendorCompetencies');
  }
};

module.exports = { updateVendorCompetencies, deleteVendorCompetencies };
