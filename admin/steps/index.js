const { Units, Step } = require('../models');
const ObjectId = require('mongodb').ObjectID;

async function insertStepsIntoUnits(step, stepId) {
  const { calculationUnit, ...stepData } = step;
  try {
    for (let { _id } of calculationUnit) {
      const unit = await Units.findOne({ _id: ObjectId(_id) });
      unit.steps.push({
        _id: stepId,
        calculationUnit: [ObjectId(_id)],
        ...stepData
      })
      await Units.updateOne({ _id: ObjectId(_id) }, unit, { upsert: true });
    }
  } catch (err) {
    console.log(err);
    console.log('Error in insertStepsIntoUnits');
  }
}

async function deleteStepsFromUnits(stepId) {
  try {
    const units = await Units.find();
    for (let unit of units) {
      const { steps } = unit;
      const filteredSteps = steps.filter(step => step._id.toString() !== stepId);
      unit.steps = filteredSteps;
      await Units.updateOne({ _id: ObjectId(unit._id) }, unit, { upsert: true });
    }
  } catch (err) {
    console.log(err);
    console.log('Error in deleteStepsFromUnits');
  }
}

async function changeStepsInUnits(stepToUpdate) {
  const { _id } = stepToUpdate;
  try {
    const step = await Step.findOne({ _id: ObjectId(_id) });
    if (stepToUpdate.calculationUnit.length > step.calculationUnit.length) {
      await insertStepsIntoUnits(stepToUpdate, _id);
    } else if (stepToUpdate.calculationUnit.length < step.calculationUnit.length) {
      await deleteStepsFromUnits(_id);
    }
    await Step.updateOne({ _id: step._id }, stepToUpdate);
  } catch (err) {
    console.log(err);
    console.log('Error in changeStepsInUnits');
  }
}

module.exports = { insertStepsIntoUnits, deleteStepsFromUnits, changeStepsInUnits }
